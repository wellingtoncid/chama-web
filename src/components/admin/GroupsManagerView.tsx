import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  Plus, Trash2, Eye, MousePointer2, X, 
  Home, Info, Users, ShieldCheck, Globe, Tag,
  Lock, Layout, Star
} from 'lucide-react';

export default function GroupsManager() {
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/list-groups');
      setGroups(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar grupos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData);
    
    const payload = {
      ...rawData,
      id: editingGroup?.id || 0,
      // Conversão de Checkboxes
      is_public: rawData.is_public === 'on' ? 1 : 0,
      is_visible_home: rawData.is_visible_home === 'on' ? 1 : 0,
      is_verified: rawData.is_verified === 'on' ? 1 : 0,
      is_premium: rawData.is_premium === 'on' ? 1 : 0,
      // Números
      member_count: Number(rawData.member_count) || 0,
      priority_level: Number(rawData.priority_level) || 0,
      // Strings e Enums
      target_role: rawData.target_role || 'all',
      display_location: rawData.display_location || 'both',
      access_type: rawData.access_type || 'public',
      status: rawData.status || 'active',
      category: rawData.category || 'Geral'
    };

    try {
      const res = await api.post('/manage-groups', payload);
      if (res.data.success) {
        setIsModalOpen(false);
        setEditingGroup(null);
        load();
      } else {
        alert("Erro ao salvar mudanças.");
      }
    } catch (err) {
      alert("Erro na requisição.");
    }
  };

  const deleteGroup = async (id: number) => {
    if(!confirm("Mover para a lixeira?")) return;
    try {
      await api.delete('/manage-groups', { data: { id } });
      load();
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-black uppercase italic text-slate-800 tracking-tighter">Gestão de Grupos</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Controle de links, métricas e novas regras de acesso</p>
        </div>
        <button 
          onClick={() => { setEditingGroup(null); setIsModalOpen(true); }}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg"
        >
          <Plus size={16} /> Adicionar Novo Grupo
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center font-black uppercase italic text-slate-300 animate-pulse">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((g: any) => (
            <div key={g.id} className={`bg-white p-6 rounded-[2.5rem] border-2 ${g.status === 'inactive' ? 'border-red-50 opacity-75' : 'border-slate-50'} shadow-sm relative group transition-all hover:shadow-xl`}>
              
              <div className="flex justify-between mb-5">
                <div className="flex gap-1.5 flex-wrap">
                  <span title="Views" className="bg-slate-50 text-slate-400 text-[9px] font-black px-2 py-1 rounded-lg flex items-center gap-1 border border-slate-100">
                    <Eye size={10}/> {g.views_count || 0}
                  </span>
                  <span title="Clicks" className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-1 rounded-lg flex items-center gap-1 border border-emerald-100">
                    <MousePointer2 size={10}/> {g.clicks_count || 0}
                  </span>
                  {g.is_visible_home === 1 && (
                    <span title="Home" className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-1 rounded-lg border border-blue-100"><Home size={10}/></span>
                  )}
                  {g.is_premium === 1 && (
                    <span title="Premium" className="bg-amber-50 text-amber-600 text-[9px] font-black px-2 py-1 rounded-lg border border-amber-100"><Star size={10} fill="currentColor"/></span>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingGroup(g); setIsModalOpen(true); }} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Plus size={14} className="rotate-45" /></button>
                  <button onClick={() => deleteGroup(g.id)} className="p-2 bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                   <p className="font-black text-slate-800 uppercase italic text-lg tracking-tighter leading-none">{g.region_name}</p>
                   <span className={`w-2 h-2 rounded-full ${g.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`}></span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] bg-slate-800 text-white px-2 py-0.5 rounded font-black uppercase tracking-widest flex items-center gap-1">
                    <Tag size={8}/> {g.category || 'Geral'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Users size={12}/> {g.member_count || 0}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-3 text-[9px] font-black uppercase text-slate-400">
                  <span>Prioridade: {g.priority_level}</span>
                  <button onClick={() => { setEditingGroup(g); setIsModalOpen(true); }} className="text-blue-600 hover:underline">Configurar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-xl rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <h2 className="font-black italic uppercase text-slate-900 text-3xl tracking-tighter">{editingGroup ? 'Editar' : 'Novo'} Grupo</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-100 rounded-full text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block">Nome / Região</label>
                <input name="region_name" defaultValue={editingGroup?.region_name} placeholder="Ex: São Paulo - SP" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent font-bold focus:border-emerald-500 outline-none" required />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block">URL do WhatsApp</label>
                <input name="invite_link" defaultValue={editingGroup?.invite_link} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent font-bold focus:border-emerald-500 outline-none" required />
              </div>

              {/* REGRAS DE EXIBIÇÃO E ACESSO (NOVAS) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1"><Layout size={12}/> Local de Exibição</label>
                <select name="display_location" defaultValue={editingGroup?.display_location || 'both'} className="w-full bg-white p-2 rounded-lg font-bold text-[11px] outline-none border border-slate-200">
                  <option value="both">Site + Plataforma</option>
                  <option value="site">Apenas Site</option>
                  <option value="platform">Apenas Plataforma</option>
                  <option value="none">Ocultar Tudo</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1"><Lock size={12}/> Regra de Clique</label>
                <select name="access_type" defaultValue={editingGroup?.access_type || 'public'} className="w-full bg-white p-2 rounded-lg font-bold text-[11px] outline-none border border-slate-200">
                  <option value="public">Link Direto</option>
                  <option value="login_required">Exigir Login</option>
                </select>
              </div>

              {/* MONETIZAÇÃO / VERIFICAÇÃO */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4 p-5 bg-slate-900 rounded-[2rem] text-white">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="is_verified" defaultChecked={editingGroup?.is_verified === 1} className="w-5 h-5 accent-blue-500" />
                  <span className="text-[10px] font-bold uppercase">Selo Verificado</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer border-l border-slate-800 pl-4">
                  <input type="checkbox" name="is_premium" defaultChecked={editingGroup?.is_premium === 1} className="w-5 h-5 accent-amber-500" />
                  <span className="text-[10px] font-bold uppercase">Card Premium</span>
                </label>
              </div>

              {/* CAMPOS ORIGINAIS PRESERVADOS */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block text-emerald-600">Categoria</label>
                <input name="category" defaultValue={editingGroup?.category || 'Geral'} className="w-full p-4 bg-emerald-50/30 rounded-2xl border-2 border-emerald-100 font-bold outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block">Prioridade (Peso)</label>
                <input type="number" name="priority_level" defaultValue={editingGroup?.priority_level || 0} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent font-bold outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block">Membros</label>
                <input type="number" name="member_count" defaultValue={editingGroup?.member_count || 0} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent font-bold outline-none" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block">Status</label>
                <select name="status" defaultValue={editingGroup?.status || 'active'} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent font-bold outline-none">
                  <option value="active">ATIVO</option>
                  <option value="inactive">INATIVO</option>
                </select>
              </div>

              {/* TOGGLES ORIGINAIS (is_public e is_visible_home) */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4 p-5 bg-slate-100 rounded-[2rem]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="is_public" defaultChecked={editingGroup ? editingGroup.is_public === 1 : true} className="w-5 h-5 accent-emerald-500" />
                  <span className="text-[10px] font-black uppercase text-slate-600 italic">Visível no Site</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer border-l border-slate-200 pl-4">
                  <input type="checkbox" name="is_visible_home" defaultChecked={editingGroup?.is_visible_home === 1} className="w-5 h-5 accent-blue-500" />
                  <span className="text-[10px] font-black uppercase text-slate-600 italic">Fixar na Home</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block">Equipe Administrativa</label>
                <textarea name="group_admin_name" defaultValue={editingGroup?.group_admin_name} rows={2} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent font-bold outline-none resize-none" />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block">Notas Internas</label>
                <textarea name="internal_notes" defaultValue={editingGroup?.internal_notes} rows={2} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent font-bold outline-none resize-none" />
              </div>
            </div>

            <button type="submit" className="w-full mt-10 bg-emerald-600 text-white py-6 rounded-[2rem] font-black uppercase italic shadow-2xl hover:bg-emerald-700 transition-all text-lg tracking-tighter transform active:scale-95">
              Confirmar Alterações
            </button>
          </form>
        </div>
      )}
    </div>
  );
}