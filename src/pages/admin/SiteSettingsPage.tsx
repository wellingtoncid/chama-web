import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  Settings, Save, RotateCcw, ChevronDown, ChevronUp,
  Truck, Package, Award, Wrench, AlertCircle, CheckCircle2,
  Loader2
} from 'lucide-react';

interface SiteSettings {
  [key: string]: string;
}

interface SettingCategory {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const CATEGORIES: SettingCategory[] = [
  { key: 'lists', label: 'Listas Padrão', icon: <Package size={20} />, description: 'Tipos de veículos, carrocerias, equipamentos e certificações' },
  { key: 'modules', label: 'Módulos', icon: <Settings size={20} />, description: 'Ativar/desativar módulos do sistema' },
  { key: 'registration', label: 'Cadastro', icon: <Settings size={20} />, description: 'Configurações de registro de usuários' },
  { key: 'finance', label: 'Financeiro', icon: <Award size={20} />, description: 'Comissões e valores' },
  { key: 'payment', label: 'Pagamentos', icon: <Settings size={20} />, description: 'Configurações de pagamento' },
];

const LIST_SETTINGS = [
  { key: 'vehicle_types', label: 'Tipos de Veículos', icon: <Truck size={18} /> },
  { key: 'body_types', label: 'Tipos de Carroceria', icon: <Package size={18} /> },
  { key: 'equipment_types', label: 'Equipamentos', icon: <Wrench size={18} /> },
  { key: 'certification_types', label: 'Certificações', icon: <Award size={18} /> },
];

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['lists']);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const jsonFormatExample = `// Para listas de equipamentos/certificacoes:
[
  {"id": "plataforma", "label": "Plataforma Elevatoria"},
  {"id": "rastreador", "label": "Rastreador GPS"}
]

// Para tipos de veiculo:
[
  {"value": "truck", "label": "Caminhao Truck - 3 eixos"}
]

// Para tipos de carroceria (simples):
["Bau", "Sider", "Grade Baixa"]`;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin-settings');
      if (res.data?.success) {
        setSettings(res.data.byCategory?.lists || {});
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    try {
      setSaving(true);
      const res = await api.post('/admin-settings', { key, value });
      if (res.data?.success) {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
      setEditingKey(null);
    }
  };

  const startEditing = (key: string, currentValue: string) => {
    setEditingKey(key);
    try {
      const parsed = JSON.parse(currentValue);
      setEditValue(JSON.stringify(parsed, null, 2));
    } catch {
      setEditValue(currentValue);
    }
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const formatJsonValue = (value: string): string => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return `${parsed.length} itens`;
      }
      if (typeof parsed === 'object') {
        return parsed.label || parsed.name || `${Object.keys(parsed).length} campos`;
      }
      return value;
    } catch {
      return value;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase italic text-slate-900">
            Configurações do Site
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
            Gerencie listas padrão e configurações globais
          </p>
        </div>
        
        {saved && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl">
            <CheckCircle2 size={18} />
            <span className="text-sm font-bold">Salvo!</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500" />
          <span className="text-red-600 text-sm">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
          <div className="flex items-center gap-3">
            <Package size={24} className="text-white" />
            <div>
              <h3 className="font-bold text-white">Listas Padrão</h3>
              <p className="text-orange-100 text-xs">Tipos de veículos, carrocerias, equipamentos e certificações</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {LIST_SETTINGS.map((setting) => {
            const isExpanded = expandedCategories.includes(setting.key);
            const isEditing = editingKey === setting.key;
            const currentValue = settings[setting.key] || '[]';
            
            return (
              <div key={setting.key}>
                {/* Header */}
                <button
                  onClick={() => toggleCategory(setting.key)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      setting.key.includes('vehicle') ? 'bg-blue-50 text-blue-500' :
                      setting.key.includes('body') ? 'bg-purple-50 text-purple-500' :
                      setting.key.includes('equipment') ? 'bg-amber-50 text-amber-500' :
                      'bg-emerald-50 text-emerald-500'
                    }`}>
                      {setting.icon}
                    </div>
                    <div className="text-left">
                      <h4 className="font-black text-slate-900">{setting.label}</h4>
                      <p className="text-[10px] text-slate-400">
                        {formatJsonValue(currentValue)}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-400" />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    {isEditing ? (
                      <div className="space-y-4">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full h-64 p-4 border border-slate-200 rounded-xl text-xs font-mono bg-white"
                          placeholder="Cole o JSON aqui..."
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveSetting(setting.key, editValue)}
                            disabled={saving}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-emerald-600 transition-colors disabled:opacity-50"
                          >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Salvar
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-xs uppercase hover:bg-slate-300 transition-colors flex items-center gap-2"
                          >
                            <RotateCcw size={14} />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <pre className="bg-white border border-slate-200 rounded-xl p-4 text-xs font-mono overflow-auto max-h-64">
                          {(() => {
                            try {
                              return JSON.stringify(JSON.parse(currentValue), null, 2);
                            } catch {
                              return currentValue;
                            }
                          })()}
                        </pre>
                        <button
                          onClick={() => startEditing(setting.key, currentValue)}
                          className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase hover:bg-slate-800 transition-colors"
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 text-sm mb-2">Formato JSON esperado</h4>
        <pre className="text-xs text-blue-800 font-mono bg-blue-100/50 rounded-lg p-3 overflow-auto">
{jsonFormatExample}
        </pre>
      </div>
      </div>
  );
}

