import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../api/api';

// COMPONENTES EXTERNOS
import CompanyCommandCenter from '../components/company/CompanyCommandCenter';
import DriverView from '../components/driver/DriverView';
import FreightManager from '../components/company/FreightManager';
import AdvertiserPortal from '../pages/advertiser/AdvertiserPortal';
import MyProfile from '../pages/profile/MyProfile';
import ChatList from './chat/ChatList';
import WelcomeOnboarding from '../components/profile/WelcomeOnboarding';

// COMPONENTES INTERNOS (ADMIN)
import DashboardAdmin from '../components/admin/DashboardAdmin'; 
import FreightsManagerView from '../components/admin/FreightManagerView';
import UsersManager from '../components/admin/UsersManagerView';
import GroupsManager from '../components/admin/GroupsManagerView'; 
import AdsManager from '../components/admin/AdsManager'; 
import SettingsView from '../components/admin/SettingsView'; 
import AdminPortalRequests from '../components/admin/AdminPortalRequests';
import AdminFinancial from '../components/admin/AdminFinancial'; 
import PlansManager from '../components/admin/PlansManager';
import AdminDashboardActivity from '../components/admin/AdminDashboardActivity';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('@ChamaFrete:user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(!user);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await api.get('get-my-profile'); 
      if (response.data.success) {
        const userData = response.data.user || response.data.data;
        setUser(userData);
        localStorage.setItem('@ChamaFrete:user', JSON.stringify(userData));
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('@ChamaFrete:token');
        localStorage.removeItem('@ChamaFrete:user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchUserData(); }, [fetchUserData]);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 italic">Sincronizando Ecossistema...</span>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  // --- LÓGICA DE PERMISSÕES (RBAC) ---
  const role = String(user.role || '').toUpperCase();
  
  // Internos (Staff)
  const isSuperAdmin = role === 'SUPERADMIN' || role === 'ADMIN';
  const isInternal = ['ADMIN', 'SUPERADMIN', 'SUPPORT', 'SALES', 'MANAGER'].includes(role);
  
  // Externos (Clientes)
  const isCompany = ['COMPANY', 'TRANSPORTADORA', 'LOGISTICS', 'WAREHOUSE', 'SHIPPER'].includes(role);
  const isDriver = ['DRIVER', 'MOTORISTA'].includes(role);
  
  // Módulos Contratados
  const hasAdsModule = !!user.is_advertiser || isInternal || isCompany;

  // LÓGICA DE BLOQUEIO / ONBOARDING
  // Verifica se faltam dados essenciais para empresas
  const showOnboarding = isCompany && (!user.company_name || !user.document);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* OVERLAY DE ONBOARDING */}
      {showOnboarding && (
        <WelcomeOnboarding 
          user={user} 
          onComplete={(updatedData: any) => {
            const newUser = { ...user, ...updatedData };
            setUser(newUser);
            localStorage.setItem('@ChamaFrete:user', JSON.stringify(newUser));
          }} 
        />
      )}

      {/* Alerta de Perfil Incompleto */}
      {!showOnboarding && user.completion_score < 100 && (
        <div className="mx-6 mt-6 mb-8 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-3xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase italic text-orange-800">Seu perfil precisa de atenção!</h4>
              <p className="text-xs text-orange-600 dark:text-orange-500/80 font-bold">Você completou apenas {user.completion_score}% do seu perfil.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('profile')}
            className="bg-orange-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase italic hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
          >
            Finalizar Agora
          </button>
        </div>
      )}

      <Routes>   
          <Route index element={
            isInternal ? <DashboardAdmin /> : 
            isCompany ? <CompanyCommandCenter user={user} refreshUser={fetchUserData} /> : 
            isDriver ? <DriverView user={user} /> : 
            <Navigate to="profile" replace />
          } />

          {isInternal && (
            <>
              <Route path="admin/bi" element={<DashboardAdmin />} />
              <Route path="admin/cargas" element={<FreightsManagerView />} />
              <Route path="admin/usuarios" element={<UsersManager />} />
              <Route path="admin/comunidades" element={<GroupsManager />} />
              <Route path="admin/financeiro" element={<AdminFinancial />} />
              <Route path="admin/publicidade" element={<AdsManager />} />
              <Route path="admin/leads" element={<AdminPortalRequests />} />
              <Route path="admin/configuracoes" element={<SettingsView />} />
              <Route path="admin/atividade" element={<AdminDashboardActivity />} />
              {isSuperAdmin && <Route path="admin/planos" element={<PlansManager />} />}
            </>
          )}

          {(isCompany || isInternal) && (
            <Route path="logistica" element={<FreightManager user={user} />} />
          )}

          {hasAdsModule && (
            <Route path="anunciante/*" element={<AdvertiserPortal user={user} />} />
          )}

          <Route path="profile" element={<MyProfile user={user} refreshUser={fetchUserData} />} />
          <Route path="chat" element={<ChatList />} />
          <Route path="vendas" element={<ModulePlaceholder title="Marketplace de Insumos" />} />
          <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </div>
  );
}

function ModulePlaceholder({ title }: { title: string }) {
  return (
    <div className="p-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl p-16 border-[6px] border-dashed border-slate-100 dark:border-slate-800 rounded-[4rem] text-center">
        <h2 className="text-4xl font-black uppercase italic text-slate-200 dark:text-slate-800 mb-2">{title}</h2>
        <p className="text-orange-500 font-bold uppercase tracking-widest text-xs">Módulo em Integração 2026</p>
      </div>
    </div>
  );
}