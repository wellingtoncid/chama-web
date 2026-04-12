import { useState, useEffect, useRef } from "react";
import { X, Save, Loader2, MapPin, Link2, User, ShieldCheck, Plus, XCircle, Upload, Image as ImageIcon, Check, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { api } from "@/api/api";
import { AdImage } from "../AdImage";

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface GroupFormProps {
  group?: any;
  onClose: () => void;
  onSave: (data: any) => void;
  categories: Category[];
  loadingCategories?: boolean;
}

const GroupForm = ({ group, onClose, onSave, categories, loadingCategories }: GroupFormProps) => {
  const [formData, setFormData] = useState({
    region_name: "",
    invite_link: "",
    image_url: "",
    description: "",
    admin_user_id: null as number | null,
    is_public: 1,
    is_visible_home: 1,
    target_role: "ALL",
    category_id: null as number | null,
    group_admin_name: "",
    other_admins: [] as string[],
    status: "active",
    is_verified: 0,
    is_premium: 0,
    display_location: "both",
    internal_notes: ""
  });
  const [newAdmin, setNewAdmin] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [linkStatus, setLinkStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');
  const isAdmin = ['admin', 'manager'].includes(user.role?.toLowerCase());

  useEffect(() => {
    if (group) {
      let otherAdmins: string[] = [];
      try {
        if (group.other_admins) {
          otherAdmins = typeof group.other_admins === 'string' 
            ? JSON.parse(group.other_admins) 
            : group.other_admins;
        }
      } catch (e) {
        otherAdmins = [];
      }
      
      setFormData({
        region_name: group.region_name || "",
        invite_link: group.invite_link || "",
        image_url: group.image_url || "",
        description: group.description || "",
        admin_user_id: group.admin_user_id || null,
        is_public: group.is_public ?? 1,
        is_visible_home: group.is_visible_home ?? 1,
        target_role: group.target_role || "ALL",
        category_id: group.category_id || null,
        group_admin_name: group.group_admin_name || "",
        other_admins: otherAdmins,
        status: group.status || "active",
        is_verified: group.is_verified ?? 0,
        is_premium: group.is_premium ?? 0,
        display_location: group.display_location || "both",
        internal_notes: group.internal_notes || ""
      });
    }
  }, [group]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.get('/list-all-users?limit=200');
      if (res.data?.success && res.data.data) {
        const userList = res.data.data.filter((u: any) => 
          u.role !== 'admin' && u.role !== 'manager'
        );
        setUsers(userList);
      }
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const selectUser = (userId: number) => {
    setFormData({ ...formData, admin_user_id: userId });
  };

  const clearUser = () => {
    setFormData({ ...formData, admin_user_id: null });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addAdmin = () => {
    const trimmed = newAdmin.trim();
    if (trimmed && !formData.other_admins.includes(trimmed)) {
      setFormData({
        ...formData,
        other_admins: [...formData.other_admins, trimmed]
      });
      setNewAdmin("");
    }
  };

  const removeAdmin = (admin: string) => {
    setFormData({
      ...formData,
      other_admins: formData.other_admins.filter(a => a !== admin)
    });
  };

  const validateWhatsAppLink = (link: string): boolean => {
    const patterns = [
      /^https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+/i,
      /^https?:\/\/whatsapp\.com\/channel\/[A-Za-z0-9_-]+/i,
    ];
    return patterns.some(pattern => pattern.test(link));
  };

  const handleInviteLinkChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, invite_link: value }));
    
    if (!value.trim()) {
      setLinkStatus('idle');
      return;
    }
    
    if (validateWhatsAppLink(value)) {
      setLinkStatus('valid');
    } else {
      setLinkStatus('invalid');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setFormData(prev => ({ ...prev, invite_link: text }));
        if (validateWhatsAppLink(text)) {
          setLinkStatus('valid');
        } else {
          setLinkStatus('invalid');
        }
      }
    } catch (err) {
      console.error('Erro ao colar:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 5MB.');
      return;
    }

    setUploadingImage(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const res = await api.post('upload-group-image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data?.url) {
        setFormData(prev => ({ ...prev, image_url: res.data.url }));
      } else {
        alert(res.data?.message || 'Erro ao fazer upload da imagem.');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao fazer upload da imagem.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const Toggle = ({ checked, onChange, label }: { checked: number; onChange: (v: number) => void; label: string }) => (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <button
        type="button"
        onClick={() => onChange(checked ? 0 : 1)}
        className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
          checked ? 'bg-emerald-500' : 'bg-slate-200'
        }`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
          checked ? 'left-6' : 'left-0.5'
        }`} />
      </button>
    </label>
  );

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 md:p-8">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">
              {group ? "Editar Grupo" : "Novo Grupo"}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {group ? "Atualize os dados" : "Cadastre um novo grupo"}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1.5">
                <MapPin size={12} /> Nome da Região / Grupo *
              </label>
              <input 
                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                value={formData.region_name}
                onChange={e => setFormData({...formData, region_name: e.target.value})}
              placeholder="Ex: Sudeste - Grãos"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1.5">
              <ImageIcon size={12} /> Imagem do Grupo
            </label>
            
            {formData.image_url ? (
              <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200">
                <AdImage url={formData.image_url} className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full py-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-sm font-medium">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={24} />
                      <span className="text-sm font-medium">Clique para enviar imagem</span>
                      <span className="text-xs">JPG, PNG ou WebP (máx. 5MB)</span>
                    </>
                  )}
                </button>
              </div>
            )}
            
            <div className="mt-2">
              <input 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-600"
                value={formData.image_url}
                onChange={e => setFormData({...formData, image_url: e.target.value})}
                placeholder="Ou cole a URL da imagem..."
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1.5">
              <Link2 size={12} /> Link do WhatsApp
            </label>
            <div className="flex gap-2">
              <input 
                className={`flex-1 mt-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium ${
                  linkStatus === 'valid' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' :
                  linkStatus === 'invalid' ? 'bg-red-50 border-red-300 text-red-700' :
                  'bg-slate-50 border-slate-200 text-blue-600'
                }`}
                value={formData.invite_link}
                onChange={handleInviteLinkChange}
                placeholder="https://chat.whatsapp.com/..."
              />
              <button
                type="button"
                onClick={handlePaste}
                className="mt-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl font-medium text-sm transition-colors"
                title="Colar do clipboard"
              >
                Colar
              </button>
            </div>
            {linkStatus === 'valid' && (
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <Check size={12} /> Link válido detectado
              </p>
            )}
            {linkStatus === 'invalid' && formData.invite_link && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> Link inválido - use links do WhatsApp
              </p>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
              Descrição do Grupo
            </label>
            <textarea 
              className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium h-24 resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Descreva o propósito deste grupo, regras, tipos de cargas aceitas, etc..."
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
              Categoria
            </label>
            {loadingCategories ? (
              <div className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-slate-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : (
              <select 
                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-600"
                value={formData.category_id || ''}
                onChange={e => setFormData({...formData, category_id: e.target.value ? parseInt(e.target.value) : null})}
              >
                <option value="">Sem categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Administrador Vinculado */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1.5">
              <User size={12} /> Usuário Administrador (vincular ao sistema)
            </label>
            
            {loadingUsers ? (
              <div className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-slate-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Carregando usuários...</span>
              </div>
            ) : (
              <select
                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-700"
                value={formData.admin_user_id || ''}
                onChange={e => selectUser(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Selecione um usuário...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email || `Usuário #${u.id}`} - {u.role || 'user'}
                  </option>
                ))}
              </select>
            )}
            <p className="text-[9px] text-slate-400 mt-1 ml-1">
              Vincule a um usuário da plataforma para exibir informações do perfil na página do grupo.
            </p>
          </div>

          {/* Administradores */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1.5">
              <User size={12} /> Nome do Administrador
            </label>
            
            {/* Admin Principal */}
            <input 
              className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
              value={formData.group_admin_name}
              onChange={e => setFormData({...formData, group_admin_name: e.target.value})}
              placeholder="Nome do admin principal (exibido publicamente)"
            />
            
            {/* Outros Admins */}
            {formData.other_admins.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.other_admins.map((admin, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                    <span className="flex-1 text-xs font-medium text-blue-700">{admin}</span>
                    <button
                      type="button"
                      onClick={() => removeAdmin(admin)}
                      className="p-1 hover:bg-blue-100 rounded text-blue-500"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Adicionar novo admin */}
            <div className="flex gap-2 mt-2">
              <input 
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-700"
                value={newAdmin}
                onChange={e => setNewAdmin(e.target.value)}
                placeholder="Adicionar mais admins..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAdmin())}
              />
              <Button 
                type="button"
                onClick={addAdmin}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <ShieldCheck size={14} /> Configurações
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Toggle 
                  checked={formData.is_visible_home} 
                  onChange={(v) => setFormData({...formData, is_visible_home: v})}
                  label="Visível na Home"
                />
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Toggle 
                  checked={formData.is_public} 
                  onChange={(v) => setFormData({...formData, is_public: v})}
                  label="Acesso Livre"
                />
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Toggle 
                  checked={formData.is_premium} 
                  onChange={(v) => setFormData({...formData, is_premium: v})}
                  label="Premium"
                />
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Toggle 
                  checked={formData.is_verified} 
                  onChange={(v) => setFormData({...formData, is_verified: v})}
                  label="Verificado"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Status</label>
              <select 
                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-600"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Quem pode ver</label>
              <select 
                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-600"
                value={formData.target_role}
                onChange={e => setFormData({...formData, target_role: e.target.value})}
              >
                <option value="ALL">Todos</option>
                <option value="DRIVER">Apenas Motoristas</option>
                <option value="COMPANY">Apenas Empresas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Onde exibir</label>
            <select 
              className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-600"
              value={formData.display_location}
              onChange={e => setFormData({...formData, display_location: e.target.value})}
            >
              <option value="both">Site + Plataforma</option>
              <option value="site">Apenas Site</option>
              <option value="platform">Apenas Plataforma</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Notas Internas</label>
            <textarea 
              className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium h-20 resize-none"
              value={formData.internal_notes}
              onChange={e => setFormData({...formData, internal_notes: e.target.value})}
              placeholder="Anotações para a equipe..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 mt-4">
            <Button 
              type="button" 
              onClick={onClose} 
              variant="ghost" 
              className="flex-1 py-5 rounded-xl font-black uppercase text-xs tracking-widest"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-[2] py-5 bg-[#1f4ead] hover:bg-blue-700 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              <Save size={16} /> Salvar
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default GroupForm;
