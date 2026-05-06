import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  Plus, Edit3, Trash2, X, Loader2, 
  Tag, Truck,
  ShoppingBag, Megaphone, FileText, Shield,
  Eye, Copy, ChevronUp, ChevronDown
} from 'lucide-react';
import Swal from 'sweetalert2';
import { PageShell, StatsGrid, StatCard } from '@/components/admin';

interface PricingRule {
  id: number;
  module_key: string;
  feature_key: string;
  feature_name: string;
  description: string | null;
  ad_size: string | null;
  icon_key: string | null;
  pricing_type: string;
  free_limit: number;
  price_per_use: number;
  price_monthly: number;
  price_daily: number;
  duration_days: number;
  is_active: number;
}

export default function PricingManager() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [filterModule, setFilterModule] = useState('all');
  const [sortBy, setSortBy] = useState('module_key');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  const [ruleData, setRuleData] = useState<any>({
    id: null,
    module_key: 'freights',
    feature_key: '',
    feature_name: '',
    description: '',
    ad_size: '',
    icon_key: '',
    pricing_type: 'free_limit',
    free_limit: 0,
    price_per_use: 0,
    price_monthly: 0,
    price_daily: 0,
    duration_days: 30,
    is_active: 1
  });

  const modules = [
    { key: 'freights', name: 'Fretes', icon: <Truck size={16} /> },
    { key: 'advertiser', name: 'Publicidade', icon: <Megaphone size={16} /> },
    { key: 'marketplace', name: 'Marketplace', icon: <ShoppingBag size={16} /> },
    { key: 'quotes', name: 'Cotações', icon: <FileText size={16} /> },
    { key: 'driver', name: 'Motorista', icon: <Shield size={16} /> }
  ];

  const loadRules = async () => {
    try {
      setLoading(true);
      // Tenta rota admin primeiro
      let res = await api.get('/admin-pricing').catch(() => null);
      
      // Se não funcionou, usa rota pública
      if (!res?.data?.success) {
        res = await api.get('/pricing/rules').catch(() => null);
        if (res?.data?.data) {
          setRules(res.data.data);
          setLoading(false);
          return;
        }
      }
      
      if (res?.data?.success) {
        setRules(res.data.data || []);
      } else {
        setRules([]);
      }
    } catch (e: any) {
      console.error("Erro ao carregar regras:", e?.message || e);
      setRules([]);
    } finally { 
      setLoading(false); 
    }
  };

  const [rotationSeconds, setRotationSeconds] = useState(8);

  const loadSettings = async () => {
    try {
      const res = await api.get('/site-settings');
      if (res.data && res.data.ad_rotation_seconds) {
        setRotationSeconds(parseInt(res.data.ad_rotation_seconds) || 8);
      }
    } catch { /* usa padrão */ }
  };

  useEffect(() => { loadRules(); loadSettings(); }, []);

  const saveRotation = async (value: number) => {
    try {
      await api.post('/admin-settings', { ad_rotation_seconds: value.toString() });
      setRotationSeconds(value);
      Swal.fire({ icon: 'success', title: 'Salvo!', timer: 1500, showConfirmButton: false });
    } catch {
      alert("Erro ao salvar");
    }
  };

  const formatPrice = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 'R$ 0,00' : `R$ ${num.toFixed(2).replace('.', ',')}`;
  };

  const getModuleInfo = (key: string) => {
    return modules.find(m => m.key === key) || { key, name: key, icon: <Tag size={16} /> };
  };

  const getModuleColor = (key: string) => {
    const colors: Record<string, string> = {
      freights: 'bg-blue-100 text-blue-600',
      advertiser: 'bg-orange-100 text-orange-600',
      marketplace: 'bg-green-100 text-green-600',
      quotes: 'bg-purple-100 text-purple-600',
      driver: 'bg-red-100 text-red-600'
    };
    return colors[key] || 'bg-slate-100 text-slate-600';
  };

  const getPricingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      free_limit: 'Limite Grátis',
      per_use: 'Por Uso',
      monthly: 'Mensal',
      daily: 'Diário'
    };
    return labels[type] || type;
  };

  const filteredRules = (() => {
    let filtered = filterModule === 'all' 
      ? rules 
      : rules.filter(r => r.module_key === filterModule);
    
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortBy as keyof PricingRule] ?? '';
        const bVal = b[sortBy as keyof PricingRule] ?? '';
        const cmp = String(aVal).localeCompare(String(bVal));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    
    return filtered;
  })();

  const stats = {
    total: rules.length,
    active: rules.filter(r => r.is_active).length,
    inactive: rules.filter(r => !r.is_active).length
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const SortHeader = ({ column, label }: { column: string, label: string }) => (
    <th 
      className="px-5 py-4 text-left text-[10px] font-bold uppercase text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortBy === column && (
          sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        )}
      </div>
    </th>
  );

  const toggleActive = async (rule: PricingRule) => {
    try {
      await api.post('/admin-pricing', { 
        ...rule, 
        is_active: rule.is_active ? 0 : 1,
        action: 'save' 
      });
      loadRules();
    } catch {
      alert("Erro ao alterar status");
    }
  };

  const handleEdit = (rule: PricingRule) => {
    setRuleData(rule);
    setShowModal(true);
  };

  const handleDuplicate = (rule: PricingRule) => {
    setRuleData({
      ...rule,
      id: null,
      feature_key: rule.feature_key + '_copy',
      feature_name: rule.feature_name + ' (Cópia)'
    });
    setShowModal(true);
  };

  const handlePreview = (rule: PricingRule) => {
    setRuleData(rule);
    setShowPreview(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Excluir regra?',
      text: "Esta ação não pode ser desfeita.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await api.post('/admin-pricing', { id, action: 'delete' });
        loadRules();
        Swal.fire({ icon: 'success', title: 'Excluído!', timer: 1500, showConfirmButton: false });
      } catch {
        alert("Erro ao excluir");
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post('/admin-pricing', { ...ruleData, action: 'save' });
      setShowModal(false);
      loadRules();
      Swal.fire({ icon: 'success', title: 'Salvo!', timer: 1500, showConfirmButton: false });
    } catch {
      alert("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (loading && rules.length === 0) return (
    <div className="p-20 text-center animate-pulse font-black uppercase italic text-slate-400">
      Carregando precificação...
    </div>
  );

  return (
    <PageShell
      title="Precificação"
      description="Configure preços por módulo, limites grátis e valores"
      actions={
        <button 
          onClick={() => { setRuleData({ id: null, module_key: 'freights', feature_key: '', feature_name: '', pricing_type: 'free_limit', free_limit: 0, price_per_use: 0, price_monthly: 0, price_daily: 0, duration_days: 30, is_active: 1 }); setShowModal(true); }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
        >
          <Plus size={18} /> Nova Regra
        </button>
      }
    >
      <div className="mt-6">
        <StatsGrid>
          <StatCard label="Total Regras" value={stats.total} icon={Tag} />
          <StatCard label="Ativas" value={stats.active} variant="green" icon={Shield} />
          <StatCard label="Inativas" value={stats.inactive} variant="red" icon={Shield} />
        </StatsGrid>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 items-center">
        <select 
          value={filterModule} 
          onChange={e => setFilterModule(e.target.value)} 
          className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Todos os Módulos</option>
          {modules.map(m => <option key={m.key} value={m.key}>{m.name}</option>)}
        </select>

        <div className="flex bg-white p-1 rounded-xl border border-slate-200 ml-auto">
          {(['module_key', 'feature_name', 'pricing_type'] as const).map(col => (
            <button key={col} onClick={() => handleSort(col)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase ${sortBy === col ? 'bg-orange-500 text-white' : 'text-slate-400'}`}>
              {col === 'module_key' ? 'Módulo' : col === 'feature_name' ? 'Nome' : 'Tipo'}
              {sortBy === col && (sortDir === 'asc' ? ' ↑' : ' ↓')}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <SortHeader column="module_key" label="Módulo" />
                <SortHeader column="feature_name" label="Recurso" />
                <th className="px-5 py-4 text-left text-[10px] font-bold uppercase text-slate-400 hidden lg:table-cell">Descrição</th>
                <SortHeader column="ad_size" label="Tamanho" />
                <SortHeader column="pricing_type" label="Tipo" />
                <th className="px-5 py-4 text-center text-[10px] font-bold uppercase text-slate-400">Grátis</th>
                <th className="px-5 py-4 text-center text-[10px] font-bold uppercase text-slate-400">Por Uso</th>
                <th className="px-5 py-4 text-center text-[10px] font-bold uppercase text-slate-400">Mensal</th>
                <th className="px-5 py-4 text-center text-[10px] font-bold uppercase text-slate-400">Duração</th>
                <th className="px-5 py-4 text-center text-[10px] font-bold uppercase text-slate-400">Status</th>
                <th className="px-5 py-4 text-right text-[10px] font-bold uppercase text-slate-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule) => {
                const modInfo = getModuleInfo(rule.module_key);
                return (
                  <tr key={rule.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase ${getModuleColor(rule.module_key)}`}>
                        {modInfo.icon} {modInfo.name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{rule.feature_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{rule.feature_key}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <p className="text-xs text-slate-500 max-w-[200px] truncate" title={rule.description || '-'}>
                        {rule.description || '-'}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-center hidden md:table-cell">
                      <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                        {rule.ad_size || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                        {getPricingTypeLabel(rule.pricing_type)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-slate-600 text-sm">
                      {rule.free_limit > 0 ? `${rule.free_limit}x` : '-'}
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-emerald-600 text-sm">
                      {formatPrice(rule.price_per_use)}
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-blue-600 text-sm">
                      {formatPrice(rule.price_monthly)}
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-slate-600 text-sm">
                      {rule.duration_days || 30} dias
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => toggleActive(rule)}
                        className={`w-12 h-6 rounded-full transition-all ${rule.is_active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${rule.is_active ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handlePreview(rule)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Preview">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleDuplicate(rule)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Duplicar">
                          <Copy size={16} />
                        </button>
                        <button onClick={() => handleEdit(rule)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(rule.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredRules.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-400 font-medium">Nenhuma regra de precificação encontrada.</p>
            <p className="text-slate-300 text-sm mt-1">Clique em "Nova Regra" para adicionar.</p>
          </div>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {ruleData.id ? 'Editar' : 'Nova'} Regra
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Módulo</label>
              <select 
                value={ruleData.module_key}
                onChange={(e) => setRuleData({...ruleData, module_key: e.target.value})}
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
              >
                {modules.map(m => (
                  <option key={m.key} value={m.key}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Chave (ID)</label>
                <input 
                  type="text" 
                  value={ruleData.feature_key}
                  onChange={(e) => setRuleData({...ruleData, feature_key: e.target.value})}
                  placeholder="sidebar, footer..."
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Nome</label>
                <input 
                  type="text" 
                  value={ruleData.feature_name}
                  onChange={(e) => setRuleData({...ruleData, feature_name: e.target.value})}
                  placeholder="Banner Lateral"
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Descrição</label>
              <input 
                type="text" 
                value={ruleData.description || ''}
                onChange={(e) => setRuleData({...ruleData, description: e.target.value})}
                placeholder="Banner exibido na barra lateral..."
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Tamanho (ex: 300x600)</label>
                <input 
                  type="text" 
                  value={ruleData.ad_size || ''}
                  onChange={(e) => setRuleData({...ruleData, ad_size: e.target.value})}
                  placeholder="300x600"
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Ícone (lucide key)</label>
                <input 
                  type="text" 
                  value={ruleData.icon_key || ''}
                  onChange={(e) => setRuleData({...ruleData, icon_key: e.target.value})}
                  placeholder="layout, star..."
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Tipo de Preço</label>
              <select 
                value={ruleData.pricing_type}
                onChange={(e) => setRuleData({...ruleData, pricing_type: e.target.value})}
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="free_limit">Limite Grátis</option>
                <option value="per_use">Por Uso</option>
                <option value="monthly">Mensal</option>
                <option value="daily">Diário</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">
                Limite Grátis (quantidade)
              </label>
              <input 
                type="number" 
                value={ruleData.free_limit}
                onChange={(e) => setRuleData({...ruleData, free_limit: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Por Uso (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={ruleData.price_per_use}
                  onChange={(e) => setRuleData({...ruleData, price_per_use: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Mensal (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={ruleData.price_monthly}
                  onChange={(e) => setRuleData({...ruleData, price_monthly: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Duração (dias)</label>
                <input 
                  type="number" 
                  value={ruleData.duration_days || 30}
                  onChange={(e) => setRuleData({...ruleData, duration_days: parseInt(e.target.value) || 30})}
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input 
                  type="checkbox" 
                  id="is_active"
                  checked={Boolean(ruleData.is_active)}
                  onChange={(e) => setRuleData({...ruleData, is_active: e.target.checked ? 1 : 0})}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="is_active" className="font-bold text-sm text-slate-600">Regra ativa</label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button 
              onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 font-bold text-xs uppercase"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : 'Salvar'}
            </button>
          </div>
          </div>
        </div>
      )}

      {/* Modal de Preview */}
      {showPreview && ruleData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black uppercase text-slate-900">Preview do Anúncio</h3>
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            {/* Preview Render */}
            <div className="bg-slate-100 rounded-xl p-4 mb-4">
              <div 
                className="bg-white rounded-lg overflow-hidden mx-auto flex items-center justify-center"
                style={{
                  width: ruleData.ad_size ? parseInt(ruleData.ad_size.split('x')[0]) || 300 : 300,
                  height: ruleData.ad_size ? parseInt(ruleData.ad_size.split('x')[1]) || 250 : 250,
                  maxWidth: '100%'
                }}
              >
                <div className="text-center p-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase mb-2 ${getModuleColor(ruleData.module_key)}`}>
                    {getModuleInfo(ruleData.module_key).name}
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{ruleData.feature_name}</p>
                  <p className="text-xs text-slate-500 mt-1">{ruleData.description || 'Sem descrição'}</p>
                  {ruleData.ad_size && (
                    <p className="text-[10px] text-slate-400 mt-2">{ruleData.ad_size}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400">Tipo</p>
                <p className="font-bold text-slate-900">{getPricingTypeLabel(ruleData.pricing_type)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Limite Grátis</p>
                <p className="font-bold text-slate-900">{ruleData.free_limit > 0 ? `${ruleData.free_limit}x` : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Por Uso</p>
                <p className="font-bold text-emerald-600">{formatPrice(ruleData.price_per_use)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Mensal</p>
                <p className="font-bold text-blue-600">{formatPrice(ruleData.price_monthly)}</p>
              </div>
            </div>

<button 
              onClick={() => setShowPreview(false)}
              className="w-full py-3 mt-4 rounded-xl bg-slate-100 text-slate-600 font-bold uppercase text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* CONFIGURAÇÕES DE PUBLICIDADE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 mt-4">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Configurações de Publicidade</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Tempo de Rotação (segundos)</label>
            <input 
              type="number" 
              min="3" 
              max="60"
              value={rotationSeconds}
              onChange={(e) => setRotationSeconds(parseInt(e.target.value) || 8)}
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button 
            onClick={() => saveRotation(rotationSeconds)}
            className="py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs uppercase mt-6"
          >
            Salvar
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">Tempo que cada anúncio fica visível antes de trocar para o próximo</p>
      </div>
    </PageShell>
   );
}