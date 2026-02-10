import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { api } from '../api/api';

// COMPONENTES EXTERNOS (CLIENTES)
import CompanyCommandCenter from '../components/company/CompanyCommandCenter';
import DriverView from '../components/driver/DriverView';
import FreightManager from '../components/company/FreightManager';
import AdvertiserPortal from '../pages/advertiser/AdvertiserPortal';
import MyProfile from '../pages/profile/MyProfile';
import ChatList from './chat/ChatList';

// COMPONENTES INTERNOS (ADMIN/STAFF) - Importados do antigo AdminView
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
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Sincronizando Ecossistema...</span>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  // --- LÓGICA DE PERMISSÕES (RBAC) ---
  const role = String(user.role || '').toUpperCase();
  
  // Internos (Staff)
  const isSuperAdmin = role === 'SUPERADMIN' || role === 'ADMIN';
  const isInternal = ['ADMIN', 'SUPERADMIN', 'SUPPORT', 'SALES', 'MANAGER'].includes(role);
  
  // Externos (Clientes)
  const isCompany = ['COMPANY', 'TRANSPORTADORA', 'LOGISTICS', 'WAREHOUSE'].includes(role);
  const isShipper = role === 'SHIPPER';
  const isDriver = ['DRIVER', 'MOTORISTA'].includes(role);
  
  // Módulos Contratados
  const hasAdsModule = !!user.is_advertiser || isInternal || isCompany;

  return (
    <Routes>   
        {/* 1. HOME DINÂMICA (Ponto de entrada conforme o perfil) */}
        <Route index element={
          isInternal ? <DashboardAdmin /> : 
          (isCompany || isShipper) ? <CompanyCommandCenter user={user} refreshUser={fetchUserData} /> : 
          isDriver ? <DriverView user={user} /> : 
          <Navigate to="profile" replace />
        } />

        {/* 2. MÓDULOS DE STAFF (Rotas de Gerenciamento) */}
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

        {/* 3. MÓDULOS OPERACIONAIS (Company / Shipper / Internal) */}
        {(isCompany || isShipper || isInternal) && (
          <Route path="logistica" element={<FreightManager user={user} />} />
        )}

        {/* 4. MÓDULO DE ANUNCIANTE (Contratável) */}
        {hasAdsModule && (
          <Route path="anunciante/*" element={<AdvertiserPortal user={user} />} />
        )}

        {/* 5. ROTAS GERAIS (Acessíveis a todos) */}
        <Route path="profile" element={<MyProfile user={user} refreshUser={fetchUserData} />} />
        <Route path="chat" element={<ChatList />} />
        <Route path="vendas" element={<ModulePlaceholder title="Marketplace de Insumos" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="" replace />} />
      
    </Routes>
  );
}

function ModulePlaceholder({ title }: { title: string }) {
  return (
    <div className="p-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl p-16 border-[6px] border-dashed border-slate-100 rounded-[4rem] text-center">
        <h2 className="text-4xl font-black uppercase italic text-slate-200 mb-2">{title}</h2>
        <p className="text-orange-500 font-bold uppercase tracking-widest text-xs">Módulo em Integração 2026</p>
      </div>
    </div>
  );
}