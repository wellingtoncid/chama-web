import { useState, useEffect } from 'react';
import { api } from '@/api/api';
import { PageShell } from '@/components/admin';
import { 
  Shield, Plus, Trash2, Edit3, X, Check, Loader2,
  Truck, ShoppingCart, Building2, Users, Megaphone, MessageSquare,
  DollarSign, Lock
} from 'lucide-react';

interface Permission {
  id: number;
  slug: string;
  label: string;
}

const moduleIcons: Record<string, React.ReactNode> = {
  freight: <Truck size={18} />,
  quotes: <ShoppingCart size={18} />,
  marketplace: <Building2 size={18} />,
  groups: <Users size={18} />,
  ads: <Megaphone size={18} />,
  support: <MessageSquare size={18} />,
  wallet: <DollarSign size={18} />,
  users: <Users size={18} />,
  roles: <Lock size={18} />,
};

export default function PermissionsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Permission[]>>({});
  const [showModal, setShowModal] = useState(false);
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [formData, setFormData] = useState({ slug: '', label: '' });

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin-permissions');
      if (res.data?.success) {
        setPermissions(res.data.data);
        setGrouped(res.data.grouped || {});
      }
    } catch {
      console.error("Erro ao carregar permissões:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPermissions(); }, []);

  const handleSave = async () => {
    if (!formData.slug || !formData.label) return alert("Preencha todos os campos");
    try {
      setSaving(true);
      if (editingPerm) {
        await api.put('/admin-permissions', { id: editingPerm.id, ...formData });
      } else {
        await api.post('/admin-permissions', formData);
      }
      setShowModal(false);
      setEditingPerm(null);
      setFormData({ slug: '', label: '' });
      await loadPermissions();
    } catch {
      alert("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir esta permissão?")) return;
    try {
      await api.delete('/admin-permissions', { data: { id } });
      await loadPermissions();
    } catch {
      alert("Erro ao excluir");
    }
  };

  const openEdit = (perm: Permission) => {
    setEditingPerm(perm);
    setFormData({ slug: perm.slug, label: perm.label });
    setShowModal(true);
  };

  if (loading) return (
    <div className="flex flex-col items-center p-20">
      <Loader2 className="animate-spin text-orange-500" size={40} />
      <p className="font-black mt-4 italic uppercase text-[10px]">Carregando Permissões...</p>
    </div>
  );

  const inputClass = "w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2";
  const labelClass = "text-[10px] font-black uppercase text-slate-400 tracking-wider";

  return (
    <PageShell
      title="Permissões"
      description="Gerencie as permissões do sistema"
      actions={
        <button
          onClick={() => { setEditingPerm(null); setFormData({ slug: '', label: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus size={20} />
          Nova Permissão
        </button>
      }
    >

      {Object.entries(grouped).map(([module, perms]) => (
        <div key={module} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black uppercase italic mb-4 flex items-center gap-2">
            <span className="text-orange-500">{moduleIcons[module] || <Shield size={18} />}</span>
            {module}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {perms.map((perm) => (
              <div key={perm.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group">
                <div>
                  <p className="font-bold text-sm text-slate-800">{perm.label}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{perm.slug}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => openEdit(perm)} className="p-2 bg-white rounded-lg text-blue-500 hover:bg-blue-50">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(perm.id)} className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Shield size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-black uppercase">Nenhuma permissão encontrada</p>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase italic">
                {editingPerm ? 'Editar' : 'Nova'} Permissão
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Slug (identificador)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '.')})}
                  className={inputClass}
                  placeholder="ex: freight.create"
                  disabled={!!editingPerm}
                />
              </div>

              <div>
                <label className={labelClass}>Label (nome exibido)</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={e => setFormData({...formData, label: e.target.value})}
                  className={inputClass}
                  placeholder="Ex: Criar Fretes"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !formData.slug || !formData.label}
                className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black uppercase mt-4 hover:bg-orange-600 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                {editingPerm ? 'Atualizar' : 'Criar'} Permissão
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
   );
}
