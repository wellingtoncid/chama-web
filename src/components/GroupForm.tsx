import { useState } from "react";
import { X, Save, Info, ShieldCheck, LayoutGrid } from "lucide-react";
import { Button } from "../components/ui/button";

const GroupForm = ({ group, onClose, onSave }: any) => {
  const [formData, setFormData] = useState(group || {
    region_name: "",
    invite_link: "",
    member_count: 0,
    is_public: 0,
    is_visible_home: 1,
    target_role: "all",
    category: "Geral",
    priority_level: 0,
    internal_notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">
              {group ? "Editar Grupo" : "Novo Grupo da Comunidade"}
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Configurações de acesso e visibilidade</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-2 gap-6">
            
            {/* COLUNA 1: DADOS PÚBLICOS */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">
                <Info size={14} /> Dados Exibidos
              </h3>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nome da Região / Grupo</label>
                <input 
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                  value={formData.region_name}
                  onChange={e => setFormData({...formData, region_name: e.target.value})}
                  placeholder="Ex: Sudeste - Grãos"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Link do WhatsApp</label>
                <input 
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-blue-600 font-medium"
                  value={formData.invite_link}
                  onChange={e => setFormData({...formData, invite_link: e.target.value})}
                  placeholder="https://chat.whatsapp.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Membros</label>
                  <input 
                    type="number"
                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                    value={formData.member_count}
                    onChange={e => setFormData({...formData, member_count: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Categoria</label>
                  <select 
                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-600"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Geral">Geral</option>
                    <option value="Grãos">Grãos</option>
                    <option value="Bau/Sider">Baú / Sider</option>
                    <option value="Caçamba">Caçamba</option>
                  </select>
                </div>
              </div>
            </div>

            {/* COLUNA 2: REGRAS E PRIVACIDADE */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-4">
                <ShieldCheck size={14} /> Regras de Acesso
              </h3>

              <div className="bg-slate-50 p-4 rounded-3xl space-y-3 border border-slate-100">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-black text-slate-600 uppercase">Visível na Home?</span>
                  <input 
                    type="checkbox" 
                    checked={formData.is_visible_home === 1}
                    onChange={e => setFormData({...formData, is_visible_home: e.target.checked ? 1 : 0})}
                    className="w-5 h-5 accent-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-black text-slate-600 uppercase">Acesso Livre?</span>
                  <input 
                    type="checkbox" 
                    checked={formData.is_public === 1}
                    onChange={e => setFormData({...formData, is_public: e.target.checked ? 1 : 0})}
                    className="w-5 h-5 accent-green-600"
                  />
                </label>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Quem pode ver?</label>
                <select 
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-600"
                  value={formData.target_role}
                  onChange={e => setFormData({...formData, target_role: e.target.value})}
                >
                  <option value="all">Todos os usuários</option>
                  <option value="driver">Apenas Motoristas</option>
                  <option value="company">Apenas Empresas</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Notas Internas</label>
                <textarea 
                  className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-xs font-medium h-20 resize-none"
                  value={formData.internal_notes}
                  onChange={e => setFormData({...formData, internal_notes: e.target.value})}
                  placeholder="Anotações para o Manager..."
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button type="button" onClick={onClose} variant="ghost" className="flex-1 py-6 rounded-2xl font-black uppercase text-xs tracking-widest">
              Cancelar
            </Button>
            <Button type="submit" className="flex-[2] py-6 bg-[#1f4ead] hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
              <Save size={18} /> Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupForm;