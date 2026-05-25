import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import {
  Save, Loader2, User, Building2, Truck, ShieldCheck,
  Calendar, CheckCircle,
  ChevronLeft, Shield, Search, Grid3X3, ToggleLeft, ToggleRight,
  ShoppingBag, FileText, Megaphone, MessageCircle, CreditCard,
  Users, Tag, HelpCircle, Wallet, DollarSign
} from 'lucide-react';
import Swal from 'sweetalert2';

const PIPELINE_STAGES = [
  { id: 'new', label: 'Novo', color: 'bg-slate-100 border-slate-300' },
  { id: 'contacted', label: 'Contatado', color: 'bg-blue-100 border-blue-300' },
  { id: 'qualification', label: 'Qualificação', color: 'bg-purple-100 border-purple-300' },
  { id: 'proposal', label: 'Proposta', color: 'bg-amber-100 border-amber-300' },
  { id: 'won', label: 'Ganho', color: 'bg-emerald-100 border-emerald-300' },
  { id: 'lost', label: 'Perdido', color: 'bg-red-100 border-red-300' },
];

const USER_TYPE_LABELS: Record<string, string> = {
  DRIVER: 'Motorista', COMPANY: 'Empresa', OPERATOR: 'Operador', ADMIN: 'Admin',
  driver: 'Motorista', company: 'Empresa', admin: 'Admin', manager: 'Gerente',
  coordinator: 'Coordenador', supervisor: 'Supervisor', analyst: 'Analista',
  assistant: 'Assistente', support: 'Suporte', finance: 'Financeiro', marketing: 'Marketing'
};

export default function UserEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);

  const [form, setForm] = useState<any>({
    name: '', email: '', whatsapp: '', password: '',
    document: '', role: 'company', status: 'pending',
    user_type: 'COMPANY', access_level: 'owner',
    company_name: '', company_document: '',
    owner_name: '', name_fantasy: '',
    assigned_to: '',
    pipeline_stage: 'new', deal_value: '', score: 0,
  });

  const [sellers, setSellers] = useState<any[]>([]);

  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [extraPermissions, setExtraPermissions] = useState<string[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(false);

  // Módulos
  const [userModules, setUserModules] = useState<any[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [savingModule, setSavingModule] = useState<string | null>(null);

  const tabs = useMemo(() => {
    const items = [{ label: 'Dados', icon: User }];
    if (!isNew) {
      items.push({ label: 'Permissões', icon: Shield });
      items.push({ label: 'Módulos', icon: Grid3X3 });
      items.push({ label: 'Carteira', icon: CreditCard });
    }
    return items;
  }, [isNew]);

  useEffect(() => {
    fetchSellers();
    if (!isNew) fetchUser();
  }, [id]);

  useEffect(() => {
    if (userData?.role) fetchPermissions();
  }, [userData?.role, userData?.id]);

  useEffect(() => {
    if (!isNew && userData?.id) fetchUserModules();
  }, [userData?.id]);

  useEffect(() => {
    if (!isNew && form.role && form.role !== userData?.role) {
      previewRolePermissions(form.role);
    }
  }, [form.role]);

  useEffect(() => {
    if (activeTab >= tabs.length) setActiveTab(0);
  }, [tabs.length]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get('list-all-users');
      const users = res.data?.data || res.data || [];
      const user = (Array.isArray(users) ? users : []).find((u: any) => String(u.id) === id);
      if (user) {
        setUserData(user);
        setForm({
          name: user.user_name || user.name || '',
          email: user.email || '',
          whatsapp: user.whatsapp || '',
          password: '',
          document: user.document || user.company_document || '',
          role: user.role || 'company',
          status: user.status || 'pending',
          user_type: user.user_type?.toUpperCase() || 'COMPANY',
          access_level: user.access_level || 'owner',
          company_name: user.company_name || user.company_corporate_name || '',
          company_document: user.company_document || '',
          owner_name: user.owner_name || '',
          name_fantasy: user.name_fantasy || '',
          assigned_to: user.assigned_to || '',
          pipeline_stage: user.pipeline_stage || 'new',
          deal_value: user.deal_value || '',
          score: user.score || 0,
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchSellers = async () => {
    try {
      const res = await api.get('internal-users');
      setSellers(res.data?.data || []);
    } catch { setSellers([]); }
  };

  const fetchPermissions = async () => {
    setLoadingPerms(true);
    try {
      const permsRes = await api.get('/admin-permissions');
      setAllPermissions(permsRes.data?.data || permsRes.data || []);

      if (userData?.role_id || userData?.role) {
        let roleId = userData.role_id;
        if (!roleId) {
          const roleRes = await api.get('/admin-roles');
          const roles = roleRes.data?.data || roleRes.data || [];
          const foundRole = roles.find((r: any) => r.slug === userData.role);
          roleId = foundRole?.id;
        }
        if (roleId) {
          const rpRes = await api.get(`/admin-role-permissions?role_id=${roleId}`);
          const rp = rpRes.data?.data || rpRes.data || [];
          setRolePermissions(rp.map((p: any) => p.slug || p));
        }
      }

      if (userData?.id) {
        const upRes = await api.get(`/admin-user-permissions?user_id=${userData.id}`);
        const perms = upRes.data?.data;
        setExtraPermissions(Array.isArray(perms) ? perms : []);
      }
    } catch { /* ignore */ }
    finally { setLoadingPerms(false); }
  };

  const handleDocumentChange = (v: string) => {
    const digits = v.replace(/\D/g, '');
    if (digits.length <= 11) {
      const m = digits.match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/);
      if (!m) return;
      setForm({ ...form, document: !m[2] ? m[1] : `${m[1]}.${m[2]}.${m[3]}-${m[4]}` });
    } else {
      const m = digits.match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
      if (!m) return;
      setForm({ ...form, document: !m[2] ? m[1] : `${m[1]}.${m[2]}.${m[3]}/${m[4]}-${m[5]}` });
    }
  };

  const handleDocumentLookup = async (doc: string) => {
    const cleanDoc = doc.replace(/\D/g, '');
    if (cleanDoc.length !== 14) return;

    try {
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${cleanDoc}`);
      if (!response.ok) throw new Error('CNPJ não encontrado');

      const res = await response.json();
      setForm((prev: any) => ({
        ...prev,
        name: res?.estabelecimento?.nome_fantasia || res?.razao_social || prev.name,
        company_name: res?.razao_social || res?.estabelecimento?.nome_fantasia || prev.company_name,
        document: cleanDoc,
      }));

      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Dados importados!', showConfirmButton: false, timer: 2000 });
    } catch {
      Swal.fire({ title: 'CNPJ não encontrado', text: 'Preencha manualmente.', icon: 'info', confirmButtonColor: '#2563eb' });
    }
  };

  const handleApprove = async () => {
    if (!window.confirm(`Liberar acesso total para ${form.name.toUpperCase()}?`)) return;
    try {
      const res = await api.post('/admin-manage-user', { id: userData.id, action: 'approve-user' });
      if (res.data.success) {
        Swal.fire({ icon: 'success', title: 'Usuário aprovado!', timer: 2000, showConfirmButton: false });
        fetchUser();
      }
    } catch { Swal.fire({ icon: 'error', title: 'Erro ao aprovar' }); }
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const userType = form.user_type === 'DRIVER' ? 'DRIVER' : form.user_type === 'COMPANY' ? 'COMPANY' : 'SYSTEM';

    if (!form.name || !form.email) {
      Swal.fire({ icon: 'warning', title: 'Nome e email são obrigatórios' });
      return;
    }
    if (isNew && !form.password) {
      Swal.fire({ icon: 'warning', title: 'Defina uma senha' });
      return;
    }
    if (isNew && userType === 'DRIVER') {
      const cpf = form.document.replace(/\D/g, '');
      if (cpf.length !== 11) {
        Swal.fire({ icon: 'warning', title: 'CPF deve ter 11 dígitos para Motorista' });
        return;
      }
    }
    if (isNew && userType === 'COMPANY') {
      const cnpj = form.document.replace(/\D/g, '');
      if (cnpj.length !== 14) {
        Swal.fire({ icon: 'warning', title: 'CNPJ deve ter 14 dígitos para Empresa' });
        return;
      }
      if (!form.owner_name) {
        Swal.fire({ icon: 'warning', title: 'Nome do responsável é obrigatório para Empresa' });
        return;
      }
    }
    if (userType === 'SYSTEM' && !form.role) {
      Swal.fire({ icon: 'warning', title: 'Cargo é obrigatório para usuário do sistema' });
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const payload: any = {
          user_type: userType,
          name: form.name,
          email: form.email,
          password: form.password,
          whatsapp: form.whatsapp,
        };

        if (userType === 'DRIVER' || userType === 'COMPANY') {
          payload.document = form.document.replace(/\D/g, '');
        }
        if (userType === 'COMPANY') {
          payload.owner_name = form.owner_name;
          payload.name_fantasy = form.name_fantasy || '';
        }
        if (userType === 'SYSTEM') {
          payload.role = form.role;
        }

        const res = await api.post('/admin-create-user', payload);
        if (res.data?.success) {
          Swal.fire({ icon: 'success', title: 'Usuário criado!', timer: 2000, showConfirmButton: false });
          navigate(`/dashboard/admin/usuarios/${res.data.user_id || res.data.id}`, { replace: true });
        } else {
          Swal.fire({ icon: 'error', title: res.data?.message || 'Erro ao criar' });
        }
      } else {
        const payload: any = {
          id: userData.id,
          action: 'update-user',
          name: form.name,
          email: form.email,
          whatsapp: form.whatsapp,
          role: form.role,
          status: form.status,
          user_type: form.user_type?.toUpperCase() || userData.user_type,
        };

        if (form.user_type === 'COMPANY') {
          payload.access_level = form.access_level;
          payload.company_name = form.company_name || form.name;
          payload.company_document = form.document.replace(/\D/g, '');
        } else {
          payload.document = form.document.replace(/\D/g, '');
        }

        if (form.password) payload.password = form.password;

        payload.assigned_to = form.assigned_to || null;
        payload.pipeline_stage = form.pipeline_stage;
        payload.deal_value = form.deal_value ? Number(form.deal_value) : 0;
        payload.score = form.score;

        const res = await api.post('/admin-manage-user', payload);
        if (res.data?.success) {
          if (extraPermissions.length > 0) {
            await api.post('/admin-user-permissions', {
              user_id: userData.id, permissions: extraPermissions
            });
          }
          Swal.fire({ icon: 'success', title: 'Dados salvos!', timer: 2000, showConfirmButton: false });
          fetchUser();
        } else {
          Swal.fire({ icon: 'error', title: res.data?.error || 'Erro ao salvar' });
        }
      }
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: e.response?.data?.message || 'Erro ao salvar' });
    } finally { setSaving(false); }
  };

  const previewRolePermissions = async (roleSlug: string) => {
    setLoadingPerms(true);
    try {
      const roleRes = await api.get('/admin-roles');
      const roles = roleRes.data?.data || roleRes.data || [];
      const foundRole = roles.find((r: any) => r.slug === roleSlug);
      if (foundRole?.id) {
        const rpRes = await api.get(`/admin-role-permissions?role_id=${foundRole.id}`);
        const rp = rpRes.data?.data || rpRes.data || [];
        setRolePermissions(rp.map((p: any) => p.slug || p));
      }
    } catch { /* ignore */ }
    finally { setLoadingPerms(false); }
  };

  const fetchUserModules = async () => {
    try {
      setLoadingModules(true);
      const res = await api.get(`/user/modules?user_id=${userData.id}`);
      if (res.data?.success) {
        setUserModules(res.data.data.modules || []);
      }
    } catch { /* ignore */ }
    finally { setLoadingModules(false); }
  };

  const toggleUserModule = async (moduleKey: string, activate: boolean) => {
    try {
      setSavingModule(moduleKey);
      await api.post('/admin/user-modules', {
        user_id: userData.id,
        module_key: moduleKey,
        action: activate ? 'activate' : 'deactivate',
      });
      setUserModules(prev =>
        prev.map(m => m.key === moduleKey ? { ...m, is_active: activate, status: activate ? 'active' : 'inactive' } : m)
      );
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro ao alternar módulo' });
    }
    finally { setSavingModule(null); }
  };

  const groupedPermissions = useMemo(() => {
    return allPermissions.reduce((acc: any, perm: any) => {
      const category = perm.slug?.split('.')[0] || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(perm);
      return acc;
    }, {} as Record<string, any[]>);
  }, [allPermissions]);

  const categoryLabels: Record<string, string> = {
    freight: 'Fretes', marketplace: 'Marketplace', cotacoes: 'Cotações',
    ads: 'Anúncios', financeiro: 'Financeiro', wallet: 'Carteira',
    grupos: 'Grupos', support: 'Suporte', chat: 'Chat',
    planos: 'Planos', driver: 'Driver Pro', users: 'Usuários', roles: 'Cargos'
  };

  const togglePermission = (slug: string) => {
    setExtraPermissions(prev =>
      prev.includes(slug) ? prev.filter(p => p !== slug) : [...prev, slug]
    );
  };

  if (loading) {
    return (
      <div className="p-20 text-center">
        <Loader2 className="animate-spin mx-auto text-indigo-500" size={40} />
        <p className="text-slate-400 font-bold mt-4 text-sm uppercase">Carregando usuário</p>
      </div>
    );
  }

  return (
    <div className="p-5 lg:p-8 max-w-[1440px] mx-auto space-y-5 lg:space-y-6 animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard/admin/usuarios')} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <ChevronLeft size={20} className="text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
              {isNew ? 'Novo Usuário' : `#${id} · ${form.name || 'Sem nome'}`}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isNew ? 'Criar nova conta na plataforma' : 'Gerenciar configurações do usuário'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (userData?.status === 'pending') && (
            <button
              onClick={handleApprove}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-emerald-700 transition-all"
            >
              <CheckCircle size={16} /> Aprovar
            </button>
          )}
          <button
            type="submit"
            form="user-editor-form"
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isNew ? 'Criar Usuário' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* STATUS BAR */}
      {!isNew && userData && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 lg:p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2
              ${userData.role === 'admin' ? 'bg-slate-900 border-slate-900 text-white' :
                'bg-white dark:bg-slate-700 border-slate-100 dark:border-slate-600 text-slate-400'}`}>
              {userData.role === 'company' && <Building2 size={20} />}
              {userData.role === 'driver' && <Truck size={20} />}
              {userData.role === 'admin' && <ShieldCheck size={20} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 dark:text-white">
                  {userData.user_name || userData.name}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  userData.status === 'active' || userData.status === 'approved'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : userData.status === 'pending'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  {userData.status === 'active' || userData.status === 'approved' ? 'Ativo' :
                   userData.status === 'pending' ? 'Pendente' : 'Inativo'}
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {userData.email} {userData.whatsapp && `· ${userData.whatsapp}`}
              </p>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Calendar size={12} />
              Desde {userData.created_at ? new Date(userData.created_at).toLocaleDateString('pt-BR') : '---'}
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-slate-700 overflow-x-auto">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2 px-5 lg:px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === i
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 lg:p-6">
          {/* TAB DADOS */}
          {activeTab === 0 && (
            <form id="user-editor-form" onSubmit={handleSave} className="space-y-6 max-w-4xl">
              <div className="flex gap-3">
                {['driver', 'company', 'system'].map(type => (
                  <button
                    key={type}
                    disabled={!isNew}
                    onClick={() => {
                      const mappings: Record<string, any> = {
                        driver: { user_type: 'DRIVER', role: 'driver' },
                        company: { user_type: 'COMPANY', role: 'company' },
                        system: { user_type: 'OPERATOR', role: 'admin' },
                      };
                      setForm({ ...form, ...mappings[type], status: 'pending' });
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase transition-all ${
                      !isNew ? 'opacity-60 cursor-not-allowed' : ''
                    } ${
                      (form.user_type?.toLowerCase() === type || (type === 'driver' && form.user_type === 'DRIVER') || (type === 'company' && form.user_type === 'COMPANY') || (type === 'system' && form.user_type === 'OPERATOR'))
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {type === 'driver' && <Truck size={16} className="inline mr-2" />}
                    {type === 'company' && <Building2 size={16} className="inline mr-2" />}
                    {type === 'system' && <ShieldCheck size={16} className="inline mr-2" />}
                    {USER_TYPE_LABELS[type.toUpperCase()] || type}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {form.user_type === 'COMPANY' && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">CNPJ *</label>
                      <div className="relative">
                        <input value={form.document} onChange={e => handleDocumentChange(e.target.value)} onBlur={e => handleDocumentLookup(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" maxLength={18} />
                        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">Razão Social *</label>
                      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">Nome Fantasia</label>
                      <input value={form.name_fantasy} onChange={e => setForm({ ...form, name_fantasy: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </>
                )}
                {form.user_type !== 'COMPANY' && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">Nome Completo *</label>
                      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">
                        {form.user_type === 'DRIVER' ? 'CPF *' : 'Documento'}
                      </label>
                      <input value={form.document} onChange={e => handleDocumentChange(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" maxLength={18} />
                    </div>
                    <div />
                  </>
                )}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">Email *</label>
                  <input autoComplete="username" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">WhatsApp</label>
                  <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">Senha {isNew ? '*' : '(deixe vazio para manter)'}</label>
                  <input type="password" autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                {form.user_type === 'COMPANY' && (
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">Responsável *</label>
                    <input value={form.owner_name} onChange={e => setForm({ ...form, owner_name: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">Cargo / Função</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                    {form.user_type === 'DRIVER' && <option value="driver">Motorista</option>}
                    {form.user_type === 'COMPANY' && <option value="company">Empresa</option>}
                    {form.user_type === 'OPERATOR' && (
                      <>
                        <option value="admin">Admin</option>
                        <option value="manager">Gerente</option>
                        <option value="coordinator">Coordenador</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="analyst">Analista</option>
                        <option value="assistant">Assistente</option>
                        <option value="support">Suporte</option>
                        <option value="finance">Financeiro</option>
                        <option value="marketing">Marketing</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="pending">Pendente</option>
                    <option value="active">Ativo</option>
                    <option value="approved">Aprovado</option>
                    <option value="inactive">Inativo</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>
                {form.user_type === 'COMPANY' && (
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">Nível de Acesso</label>
                    <select value={form.access_level} onChange={e => setForm({ ...form, access_level: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="owner">Owner (Dono)</option>
                      <option value="manager">Gerente</option>
                      <option value="user">Usuário</option>
                    </select>
                  </div>
                )}
              </div>

              {!isNew && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl space-y-3">
                  <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">CRM / Pipeline</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">Estágio</label>
                      <select value={form.pipeline_stage} onChange={e => setForm({ ...form, pipeline_stage: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                        {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">Valor (R$)</label>
                      <input value={form.deal_value} onChange={e => setForm({ ...form, deal_value: e.target.value.replace(/\D/g, '') })} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">Score (0-100)</label>
                      <input type="number" min={0} max={100} value={form.score} onChange={e => setForm({ ...form, score: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5 block">Responsável</label>
                      <select value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Não atribuído</option>
                        {sellers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* TAB MÓDULOS */}
          {activeTab === 2 && (
            <div className="space-y-4 max-w-4xl">
              {loadingModules ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-indigo-500" size={24} />
                </div>
              ) : userModules.length === 0 ? (
                <p className="text-slate-400 text-center py-8 text-sm font-medium">
                  Nenhum módulo disponível para este tipo de usuário
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {userModules.map(mod => {
                    const moduleIcons: Record<string, React.ReactNode> = {
                      freights: <Truck size={20} />,
                      marketplace: <ShoppingBag size={20} />,
                      quotes: <FileText size={20} />,
                      advertiser: <Megaphone size={20} />,
                      chat: <MessageCircle size={20} />,
                      financial: <CreditCard size={20} />,
                      groups: <Users size={20} />,
                      plans: <Tag size={20} />,
                      support: <HelpCircle size={20} />,
                      driver: <Shield size={20} />,
                    };
                    return (
                      <div
                        key={mod.key}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          mod.is_active
                            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            mod.is_active
                              ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-600 text-slate-400'
                          }`}>
                            {moduleIcons[mod.key] || <Grid3X3 size={20} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{mod.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{mod.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                            mod.is_active
                              ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-600 text-slate-400'
                          }`}>
                            {mod.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                          <button
                            onClick={() => toggleUserModule(mod.key, !mod.is_active)}
                            disabled={savingModule === mod.key}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                              savingModule === mod.key
                                ? 'opacity-50 cursor-not-allowed'
                                : mod.is_active
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200'
                                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200'
                            }`}
                          >
                            {savingModule === mod.key ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : mod.is_active ? (
                              <ToggleRight size={14} />
                            ) : (
                              <ToggleLeft size={14} />
                            )}
                            {mod.is_active ? 'Desativar' : 'Ativar'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB CARTEIRA */}
          {activeTab === 3 && (
            <div className="space-y-6 max-w-4xl">
              <WalletSection userId={userData?.id} />
            </div>
          )}

          {/* TAB PERMISSÕES */}
          {activeTab === 1 && (
            <div className="space-y-6 max-w-4xl">
                  {loadingPerms ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin text-indigo-500" size={24} />
                    </div>
                  ) : allPermissions.length === 0 ? (
                    <p className="text-slate-400 text-center py-8 text-sm font-medium">
                      Nenhuma permissão disponível para este tipo de usuário
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedPermissions).map(([category, perms]: [string, any]) => (
                        <div key={category}>
                          <div className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-3 pb-2 border-b border-slate-200 dark:border-slate-600">
                            {categoryLabels[category] || category}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {perms.map((perm: any) => {
                              const inRole = rolePermissions.includes(perm.slug);
                              const isExtra = extraPermissions.includes(perm.slug);
                              return (
                                <label
                                  key={perm.id || perm.slug}
                                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                                    inRole
                                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                      : isExtra
                                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                      : 'bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={inRole || isExtra}
                                    onChange={() => !inRole && togglePermission(perm.slug)}
                                    disabled={inRole}
                                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                  />
                                  <span className="text-xs font-bold flex-1">{perm.label || perm.slug}</span>
                                  {inRole && <span className="text-[9px] bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded font-bold">CARGO</span>}
                                  {isExtra && !inRole && <span className="text-[9px] bg-purple-200 dark:bg-purple-800 px-1.5 py-0.5 rounded font-bold">EXTRA</span>}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
          )}
        </div>
      </div>
    </div>
  );
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtDate = (s: string) =>
  s ? new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

function WalletSection({ userId }: { userId: number | undefined }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadBalance = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await api.get(`/wallet/balance?user_id=${userId}`);
      if (res.data?.success) {
        setBalance(res.data.data.balance ?? 0);
        setTransactions(res.data.data.transactions || []);
      }
    } catch { /* */ }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { loadBalance(); }, [loadBalance]);

  const handleCredit = async () => {
    const v = parseFloat(amount.replace(',', '.'));
    if (!userId || isNaN(v) || v <= 0) {
      Swal.fire({ icon: 'warning', title: 'Valor inválido' });
      return;
    }
    setSending(true);
    try {
      const res = await api.post('/admin/add-credits', {
        user_id: userId,
        amount: v,
        reason: reason || 'Crédito administrativo',
      });
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: `R$ ${v.toFixed(2)} creditado!`, timer: 2000, showConfirmButton: false });
        setAmount('');
        setReason('');
        loadBalance();
      } else {
        Swal.fire({ icon: 'error', title: res.data?.message || 'Erro ao creditar' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro ao creditar' });
    }
    finally { setSending(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
        <Loader2 className="animate-spin text-orange-500" size={20} />
        <span className="text-xs font-medium text-slate-400">Carregando carteira...</span>
      </div>
    );
  }

  const walletTransactions = transactions.filter((t: any) =>
    ['wallet_recharge', 'wallet_debit', 'wallet_refund'].includes(t.transaction_type)
  );

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 text-orange-100 text-xs font-medium mb-1">
          <Wallet size={14} /> Saldo da Carteira
        </div>
        <p className="text-3xl font-black tabular-nums">
          {fmt(balance)}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <p className="text-[10px] font-black uppercase text-slate-400">Creditar na Carteira</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={amount}
            onChange={e => setAmount(e.target.value.replace(/[^0-9,]/g, ''))}
            placeholder="Valor (R$)"
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleCredit}
            disabled={sending || !amount}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
            Creditar
          </button>
        </div>
        <input
          type="text"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Motivo (opcional)"
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Histórico */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-[10px] font-black uppercase text-slate-400">Histórico de Movimentações</p>
        </div>
        {walletTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <Wallet size={28} className="mx-auto mb-2 text-slate-200" />
            <p className="text-xs text-slate-400 font-medium">Nenhuma movimentação</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="text-left px-4 py-2.5 text-[10px] font-black uppercase text-slate-400">Descrição</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-black uppercase text-slate-400">Data</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-black uppercase text-slate-400">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {walletTransactions.map((tx: any) => {
                  const amt = parseFloat(tx.amount) || 0;
                  const isCredit = amt > 0;
                  const label =
                    tx.transaction_type === 'wallet_recharge' ? 'Recarga' :
                    tx.transaction_type === 'wallet_refund' ? 'Estorno' :
                    tx.description || 'Débito';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-bold text-slate-700">{label}</p>
                        {tx.description && tx.transaction_type !== 'wallet_recharge' && tx.transaction_type !== 'wallet_refund' && (
                          <p className="text-[10px] text-slate-400">{tx.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-[10px] text-slate-400">{fmtDate(tx.created_at)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`text-xs font-black tabular-nums ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                          {isCredit ? '+' : '-'}{fmt(Math.abs(amt))}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
