import React, { useState } from 'react';
import { X, User, Mail, Shield, Building2, Truck } from 'lucide-react';
import { api } from '../../api/api';

export default function ProfilePermissionsModal({ user, onClose, onSave }: any) {
  const isNew = !user.id;

  // Determinar userType inicial baseado no user_type do banco
  const getInitialUserType = () => {
    const ut = user?.user_type?.toUpperCase();
    if (ut === 'DRIVER') return 'driver';
    if (ut === 'OPERATOR' || ut === 'ADMIN') return 'system';
    if (ut === 'COMPANY') return 'company';
    // Fallback baseado no role
    if (user?.role === 'driver') return 'driver';
    if (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'coordinator') return 'system';
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

  const [loading, setLoading] = useState(false);

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