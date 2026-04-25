import React, { useState, useEffect } from 'react';
import { X, User, Shield, Building2, Truck, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../../api/api';

export default function ProfilePermissionsModal({ user, onClose, onSave }: any) {
  const isNew = !user.id;

  // Verificar se é usuário do sistema (pode ter permissões extras)
  const systemRoles = ['admin', 'manager', 'support', 'coordinator', 'supervisor', 'finance', 'marketing', 'director', 'analyst', 'assistant', 'operator'];
  const isSystemUser = isNew ? userType === 'system' : systemRoles.includes(user?.role);

  // Determinar userType inicial baseado no user_type do banco
  const getInitialUserType = () => {
    const ut = user?.user_type?.toUpperCase();
    if (ut === 'DRIVER') return 'driver';
    if (ut === 'OPERATOR' || ut === 'ADMIN') return 'system';
    if (ut === 'COMPANY') return 'company';
    // Fallback baseado no role
    if (user?.role === 'driver') return 'driver';
    if (systemRoles.includes(user?.role)) return 'system';
    return 'company';
  };

  // --- ESTADOS ---
  const [userName, setUserName] = useState(user?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [userWhatsapp, setUserWhatsapp] = useState(user?.whatsapp || '');
  const [userPassword, setUserPassword] = useState(''); 
  const [userRole, setUserRole] = useState(user?.role || 'company');
  const [userStatus, setUserStatus] = useState(user?.status || 'pending');
  const [userType, setUserType] = useState(getInitialUserType());
  const [accessLevel, setAccessLevel] = useState(user?.access_level || 'owner');
  
  // Company data from accounts table (via listAllUsers query)
  const [companyName, setCompanyName] = useState(user?.company_name || user?.corporate_name || '');
  const [companyDocument, setCompanyDocument] = useState(user?.company_document || user?.cnpj || '');
  const [cpf, setCpf] = useState(user?.cpf || '');

  // Permissões
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [extraPermissions, setExtraPermissions] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [permissionsExpanded, setPermissionsExpanded] = useState(false);

  const [loading, setLoading] = useState(false);

  // Carregar permissões quando o modal abre (apenas para usuários do sistema)
  useEffect(() => {
    if (!isNew && isSystemUser && user?.id) {
      loadPermissions();
    }
  }, [user?.id, isSystemUser, isNew]);

  const loadPermissions = async () => {
    setLoadingPermissions(true);
    try {
      // Buscar todas as permissões disponíveis
      const permsRes = await api.get('/admin-permissions');
      const permissions = permsRes.data?.data || permsRes.data || [];
      setAllPermissions(permissions);

      // Buscar permissões do cargo do usuário
      if (user?.role_id || user?.role) {
        let roleId = user.role_id;
        if (!roleId) {
          // Buscar role_id pelo slug
          const roleRes = await api.get('/admin-roles');
          const roles = roleRes.data?.data || roleRes.data || [];
          const foundRole = roles.find((r: any) => r.slug === user.role);
          roleId = foundRole?.id;
        }
        
        if (roleId) {
          const rolePermsRes = await api.get(`/admin-role-permissions?role_id=${roleId}`);
          const rolePerms = rolePermsRes.data?.data || rolePermsRes.data || [];
          setRolePermissions(rolePerms.map((p: any) => p.slug || p));
        }
      }

      // Buscar permissões extras do usuário (do campo users.permissions JSON)
      const userPermsRes = await api.get(`/admin-user-permissions?user_id=${user.id}`);
      const userPerms = userPermsRes.data?.data || [];
      setExtraPermissions(userPerms);

    } catch (e) {
      console.error('Erro ao carregar permissões:', e);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleCompanyDocumentChange = (v: string) => {
    const x = v.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
    if (!x) return;
    setCompanyDocument(!x[2] ? x[1] : x[1] + '.' + x[2] + '.' + x[3] + '/' + x[4] + (x[5] ? '-' + x[5] : ''));
  };

  const handleCpfChange = (v: string) => {
    const x = v.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/);
    if (!x) return;
    setCpf(!x[2] ? x[1] : x[1] + '.' + x[2] + '.' + x[3] + '-' + x[4]);
  };

  const togglePermission = (slug: string) => {
    if (extraPermissions.includes(slug)) {
      setExtraPermissions(extraPermissions.filter(p => p !== slug));
    } else {
      setExtraPermissions([...extraPermissions, slug]);
    }
  };

  const isPermissionFromRole = (slug: string) => {
    return rolePermissions.includes(slug);
  };

  const handleSave = async () => {
    if (!userName || !userEmail) return alert("Preencha Nome e E-mail.");
    if (isNew && !userPassword) return alert("Defina uma senha.");
    
    // Validações de CPF/CNPJ
    if ((userType === 'driver' || userType === 'system') && cpf && cpf.replace(/\D/g, '').length !== 11) {
      return alert("CPF deve ter 11 dígitos");
    }
    if (userType === 'company' && companyDocument && companyDocument.replace(/\D/g, '').length !== 14) {
      return alert("CNPJ deve ter 14 dígitos");
    }

    setLoading(true);
    try {
      // Mapear userType para o valor do banco
      const userTypeMap: Record<string, string> = {
        'driver': 'DRIVER',
        'company': 'COMPANY',
        'system': 'OPERATOR'
      };

      const payload = {
        id: user?.id,
        action: 'update-user',
        name: userName,
        email: userEmail,
        whatsapp: userWhatsapp,
        role: userRole,
        status: userStatus,
        user_type: userTypeMap[userType] || 'COMPANY',
        access_level: userType === 'company' ? accessLevel : null,
        company_name: userType === 'company' ? companyName : (userType === 'driver' ? '' : null),
        company_corporate_name: userType === 'company' ? companyName : null,
        company_document: userType === 'company' ? companyDocument.replace(/\D/g, '') : null,
        company_document_type: userType === 'company' ? 'CNPJ' : null,
        document: userType === 'driver' || userType === 'system' ? cpf.replace(/\D/g, '') : null,
        document_type: userType === 'driver' || userType === 'system' ? 'CPF' : null
      };

      const res = await api.post('/admin-manage-user', payload);
      
      if (res.data.success) { 
        // Salvar permissões extras (apenas para usuários do sistema)
        if (isSystemUser && user?.id && !isNew) {
          try {
            await api.post('/admin-user-permissions', {
              user_id: user.id,
              permissions: extraPermissions
            });
          } catch (e) {
            console.error('Erro ao salvar permissões extras:', e);
          }
        }
        
        alert("Dados salvos com sucesso!");
        onSave(); 
        onClose(); 
      } else {
        alert("Erro: " + (res.data.error || "Erro desconhecido"));
      }
    } catch { 
      alert("Erro ao salvar."); 
    } finally { 
      setLoading(false); 
    }
  };

  // Agrupar permissões por categoria
  const groupedPermissions = allPermissions.reduce((acc: any, perm: any) => {
    const category = perm.slug.split('.')[0];
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    freight: 'Fretes',
    marketplace: 'Marketplace',
    cotacoes: 'Cotações',
    ads: 'Anúncios',
    financeiro: 'Financeiro',
    wallet: 'Carteira',
    grupos: 'Grupos',
    support: 'Suporte',
    chat: 'Chat',
    planos: 'Planos',
    driver: 'Driver Pro',
    users: 'Usuários',
    roles: 'Cargos'
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className={`p-8 border-b border-slate-100 flex justify-between items-center ${isNew ? 'bg-blue-50/50' : 'bg-slate-50/50'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${userRole === 'admin' ? 'bg-red-600' : 'bg-blue-600'}`}>
              {userRole === 'driver' ? <User size={24}/> : (userRole === 'admin' ? <Shield size={24} /> : <Building2 size={24} />)}
            </div>
            <div>
              <h2 className="text-xl font-black uppercase italic text-slate-900 leading-none">
                {isNew ? 'Novo Cadastro' : 'Gestão de Perfil'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
                {isNew ? 'Definindo novo acesso' : `ID: #${user.id} • Nível: ${userRole}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-red-500 transition-colors"><X size={24}/></button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto">
          
          {/* TIPO DE USUÁRIO - APENAS EXIBIÇÃO (detecção automática) */}
          <div className="flex gap-2 mb-4">
            <div className={`flex-1 py-3 px-4 rounded-xl font-black uppercase text-xs text-center ${
              userType === 'driver' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
              userType === 'company' ? 'bg-green-100 text-green-700 border border-green-200' : 
              'bg-purple-100 text-purple-700 border border-purple-200'
            }`}>
              {userType === 'driver' && <Truck size={16} className="inline mr-2" />}
              {userType === 'company' && <Building2 size={16} className="inline mr-2" />}
              {userType === 'system' && <Shield size={16} className="inline mr-2" />}
              {userType === 'driver' ? 'Motorista' : userType === 'company' ? 'Empresa' : 'Sistema'}
            </div>
          </div>

          {/* SELETORES DE ACESSO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Access Level - só para Empresa */}
            {userType === 'company' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 italic">Nível de Acesso</label>
                <select value={accessLevel} onChange={e => setAccessLevel(e.target.value)} className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl font-black text-[10px] uppercase outline-none focus:ring-2 ring-blue-500/20">
                  <option value="owner">Owner (Dono)</option>
                  <option value="manager">Gerente</option>
                  <option value="user">Usuário</option>
                </select>
              </div>
            )}

            {/* Role/Cargo - para Sistema */}
            {userType === 'system' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 italic">Cargo</label>
                <select value={userRole} onChange={e => setUserRole(e.target.value)} className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl font-black text-[10px] uppercase outline-none focus:ring-2 ring-blue-500/20">
                  <option value="admin">Admin</option>
                  <option value="manager">Gerente</option>
                  <option value="coordinator">Coordenador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="analyst">Analista</option>
                  <option value="assistant">Assistente</option>
                  <option value="support">Suporte</option>
                  <option value="finance">Financeiro</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 italic">Status da Conta</label>
              <select value={userStatus} onChange={e => setUserStatus(e.target.value)} className={`w-full px-4 py-3 border-none rounded-xl font-black text-[10px] uppercase outline-none ${userStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                <option value="pending">Aguardando Aprovação</option>
                <option value="approved">Ativo / Liberado</option>
                <option value="blocked">Bloqueado / Inativo</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>

          {/* DADOS DA EMPRESA - Só aparece se Tipo for 'company' */}
          {userType === 'company' && (
            <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-blue-600 ml-1 italic">Segmento</label>
                  <select value={userType} onChange={e => setUserType(e.target.value)} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl font-black text-[10px] uppercase outline-none">
                    <option value="transportadora">Transportadora</option>
                    <option value="comercio">Comércio / Embarcador</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-blue-600 ml-1 italic">CNPJ</label>
                  <input value={companyDocument} onChange={e => handleCompanyDocumentChange(e.target.value)} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl font-bold text-xs outline-none" placeholder="00.000.000/0000-00"/>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-blue-600 ml-1 italic">Razão Social / Nome Fantasia</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl font-bold text-xs outline-none" placeholder="Nome da Empresa para identificação rápida"/>
              </div>
            </div>
          )}

          {/* CPF - Para Motorista e Sistema */}
          {(userType === 'driver' || userType === 'system') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-blue-600 ml-1 italic">CPF</label>
                <input value={cpf} onChange={e => handleCpfChange(e.target.value)} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl font-bold text-xs outline-none" placeholder="000.000.000-00" maxLength={14}/>
              </div>
            </div>
          )}

          {/* DADOS DE CONTATO E LOGIN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 italic">Nome do Responsável</label>
              <input value={userName} onChange={e => setUserName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none"/>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 italic">WhatsApp (Login)</label>
              <input value={userWhatsapp} onChange={e => setUserWhatsapp(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none" placeholder="(00) 00000-0000"/>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 italic">E-mail</label>
              <input value={userEmail} disabled={!isNew} onChange={e => setUserEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none disabled:opacity-50"/>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-orange-600 ml-1 italic">Senha</label>
              <input type="password" value={userPassword} onChange={e => setUserPassword(e.target.value)} className="w-full px-4 py-3 bg-orange-50 border border-orange-100 rounded-xl font-bold text-xs outline-none" placeholder="******"/>
            </div>
          </div>

          {/* PERMISSÕES EXTRAS - Apenas para usuários do sistema */}
          {isSystemUser && !isNew && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setPermissionsExpanded(!permissionsExpanded)}
                className="w-full flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-purple-600" />
                  <div className="text-left">
                    <span className="text-xs font-black uppercase text-purple-700">Permissões Extras</span>
                    <p className="text-[10px] text-purple-500">
                      {extraPermissions.length > 0 
                        ? `${extraPermissions.length} permissão(ões) extra(s)`
                        : 'Nenhuma permissão extra'
                      }
                    </p>
                  </div>
                </div>
                {permissionsExpanded ? <ChevronDown size={20} className="text-purple-600" /> : <ChevronRight size={20} className="text-purple-600" />}
              </button>

              {permissionsExpanded && (
                <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 max-h-64 overflow-y-auto">
                  {loadingPermissions ? (
                    <div className="text-center py-4 text-slate-400 text-xs">Carregando permissões...</div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(groupedPermissions).map(([category, perms]: [string, any]) => (
                        <div key={category}>
                          <div className="text-[10px] font-black uppercase text-slate-400 mb-2 pb-1 border-b border-slate-200">
                            {categoryLabels[category] || category}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {perms.map((perm: any) => {
                              const isInRole = isPermissionFromRole(perm.slug);
                              const isExtra = extraPermissions.includes(perm.slug);
                              
                              return (
                                <label
                                  key={perm.id || perm.slug}
                                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                    isInRole 
                                      ? 'bg-slate-200/50 text-slate-600' 
                                      : isExtra 
                                        ? 'bg-purple-50 text-purple-700' 
                                        : 'bg-white text-slate-500 hover:bg-slate-100'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isInRole || isExtra}
                                    onChange={() => !isInRole && togglePermission(perm.slug)}
                                    disabled={isInRole}
                                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                  />
                                  <div className="flex-1">
                                    <span className="text-[10px] font-bold">{perm.label}</span>
                                    {isInRole && (
                                      <span className="text-[9px] block text-slate-400">(do cargo)</span>
                                    )}
                                  </div>
                                  {isInRole && (
                                    <Check size={14} className="text-slate-400" />
                                  )}
                                  {isExtra && !isInRole && (
                                    <span className="text-[9px] bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded">EXTRA</span>
                                  )}
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
              
              <p className="text-[9px] text-slate-400 mt-2 text-center">
                * Permissões do cargo são automáticas. Marque permissões extras para este usuário específico.
              </p>
            </div>
          )}

          <hr className="border-slate-100" />

        </div>

        {/* FOOTER */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 text-slate-400 font-black text-[10px] uppercase">Cancelar</button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className={`px-10 py-4 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl transition-all ${isNew ? 'bg-blue-600' : 'bg-slate-900'}`}
          >
            {loading ? 'Salvando...' : (isNew ? 'Criar Usuário' : 'Salvar Alterações')}
          </button>
        </div>        
      </div>
    </div>
  );
}