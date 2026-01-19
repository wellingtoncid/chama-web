import React, { useState } from 'react';
import { X, ShieldCheck, Eye, Edit3, CheckCircle2, Lock, User, Mail, Shield, Building2, Phone, Clock, Globe, Megaphone } from 'lucide-react';
import { api } from '../../api';

export default function ProfilePermissionsModal({ user, onClose, onSave }: any) {
  const isNew = !user.id;

  // --- ESTADOS ---
  const [userName, setUserName] = useState(user?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [userWhatsapp, setUserWhatsapp] = useState(user?.whatsapp || '');
  const [userPassword, setUserPassword] = useState(''); 
  const [userRole, setUserRole] = useState(user?.role || 'company');
  const [userStatus, setUserStatus] = useState(user?.status || 'pending');
  const [userType, setUserType] = useState(user?.user_type || 'transportadora');
  
  const [companyName, setCompanyName] = useState(user?.company_name || '');
  const [cnpj, setCnpj] = useState(user?.cnpj || '');

  const [perms, setPerms] = useState<Record<string, boolean>>(() => {
    try {
      if (typeof user.permissions === 'string') return JSON.parse(user.permissions || '{}');
      return user.permissions || {};
    } catch { return {}; }
  });

  const [loading, setLoading] = useState(false);

  const handleCnpjChange = (v: string) => {
    const x = v.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
    if (!x) return;
    setCnpj(!x[2] ? x[1] : x[1] + '.' + x[2] + '.' + x[3] + '/' + x[4] + (x[5] ? '-' + x[5] : ''));
  };

  const handleSave = async () => {
    if (!userName || !userEmail) return alert("Preencha Nome e E-mail.");
    if (isNew && !userPassword) return alert("Defina uma senha.");
    
    setLoading(true);
    try {
      const payload = {
        id: user.id,
        action: isNew ? 'create-user-admin' : 'update-permissions',
        name: userName,
        email: userEmail,
        whatsapp: userWhatsapp,
        password: userPassword,
        role: userRole,
        status: userStatus,
        user_type: userRole === 'driver' ? 'motorista' : userType,
        company_name: userRole === 'driver' ? '' : companyName,
        cnpj: userRole === 'driver' ? '' : cnpj,
        permissions: perms
      };

      const res = await api.post('', payload, { params: { endpoint: 'manage-users-admin' } });
      
      if (res.data.success) { 
        alert("Dados salvos com sucesso!");
        onSave(); 
        onClose(); 
      } else {
        alert("Erro: " + (res.data.error || "Erro desconhecido"));
      }
    } catch (e) { 
      alert("Erro ao salvar."); 
    } finally { 
      setLoading(false); 
    }
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
          
          {/* SELETORES DE TIPO E ACESSO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 italic">Tipo de Acesso (Role)</label>
              <select value={userRole} onChange={e => setUserRole(e.target.value)} className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl font-black text-[10px] uppercase outline-none focus:ring-2 ring-blue-500/20">
                <option value="company">🏢 Empresa / Negócio</option>
                <option value="driver">🚚 Motorista Particular</option>
                <option value="admin">🔑 Administrador Master</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 italic">Status da Conta</label>
              <select value={userStatus} onChange={e => setUserStatus(e.target.value)} className={`w-full px-4 py-3 border-none rounded-xl font-black text-[10px] uppercase outline-none ${userStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                <option value="pending">Aguardando Aprovação</option>
                <option value="approved">Ativo / Liberado</option>
                <option value="blocked">Bloqueado / Inativo</option>
              </select>
            </div>
          </div>

          {/* DADOS DA EMPRESA - Só aparece se Role for 'company' */}
          {userRole === 'company' && (
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
                  <input value={cnpj} onChange={e => handleCnpjChange(e.target.value)} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl font-bold text-xs outline-none" placeholder="00.000.000/0000-00"/>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-blue-600 ml-1 italic">Razão Social / Nome Fantasia</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl font-bold text-xs outline-none" placeholder="Nome da Empresa para identificação rápida"/>
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

          <hr className="border-slate-100" />

          {/* PERMISSÕES OPERACIONAIS */}
          <div>
            <h3 className="text-[10px] font-black uppercase text-slate-800 mb-4 tracking-widest italic flex items-center gap-2">
              <ShieldCheck size={14} className="text-blue-500"/> Privilégios do Usuário
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PermissionToggle title="Gerir Cargas" active={perms.approve_freights} onClick={() => setPerms({...perms, approve_freights: !perms.approve_freights})} />
              <PermissionToggle title="Ver Financeiro" active={perms.view_finance} onClick={() => setPerms({...perms, view_finance: !perms.view_finance})} />
              <PermissionToggle title="Gerir Operadores" active={perms.edit_users} onClick={() => setPerms({...perms, edit_users: !perms.edit_users})} />
              <PermissionToggle title="Configurações" active={perms.view_logs} onClick={() => setPerms({...perms, view_logs: !perms.view_logs})} />
            </div>
          </div>
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

function PermissionToggle({ title, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${active ? 'border-blue-500 bg-blue-50/30 text-blue-700' : 'border-slate-100 text-slate-500'}`}>
      <span className="text-[10px] font-black uppercase italic">{title}</span>
      {active ? <CheckCircle2 size={18} /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-200" />}
    </button>
  );
}