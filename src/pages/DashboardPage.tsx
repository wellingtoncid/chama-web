import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { isInternal as isInternalRole, isCompany as isCompanyRole, isDriver as isDriverRole, isSuperAdmin as isSuperAdminRole } from '../constants/roleUtils';

import CompanyCommandCenter from '../components/company/CompanyCommandCenter';
import DriverView from '../components/driver/DriverView';
import FreightManager from '../components/company/FreightManager';
import AdvertiserPortal from '../pages/advertiser/AdvertiserPortal';
import MyProfile from '../pages/profile/MyProfile';
import ChatPage from './chat/ChatPage';
import WelcomeOnboarding from '../components/profile/WelcomeOnboarding';

import PlansPage from './plans/PlansPage';
import FreightModule from './plans/components/FreightModule';
import MarketplaceModule from './plans/components/MarketplaceModule';
import AdvertiserModule from './plans/components/AdvertiserModule';
import AvulsoPage from './plans/components/AvulsoPage';
import DriverModule from './plans/components/DriverModule';
import { PlansProvider } from '../context/PlansContext';
import CompanyProPage from './company/CompanyProPage';
import FinancialPage from './financial/FinancialPage';
import SupportPage from './support/SupportPage';
import QuotesPage from './quotes/QuotesPage';
import MarketplaceManager from '../modules/marketplace/MarketplaceManager';

import DashboardHome from '../components/admin/DashboardHome';
import { getAdminRouteElements } from '../components/admin/AdminRoutes';
import MyArticlesPage from './MyArticlesPage';
import TeamPage from './team/TeamPage';

interface User {
  id: number;
  role?: string;
  company_name?: string;
  document?: string;
  completion_score?: number;
  [key: string]: unknown;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user: authUser, login: authLogin, logout: authLogout } = useAuth();
  const [hasDismissedOnboarding, setHasDismissedOnboarding] = useState(false);
  const [user, setUser] = useState<User | null>(authUser as User | null);
  const [loading, setLoading] = useState(false);

  const fetched = useRef(false);

  const fetchUserData = useCallback(async () => {
    if (fetched.current) return;
    fetched.current = true;
    try {
      const response = await api.get('get-my-profile'); 
      if (response.data.success) {
        const userData = response.data.user || response.data.data;
        setUser(userData);
        authLogin(userData);
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 401 || error.response?.status === 403) {
        authLogout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, authLogin, authLogout]);

  useEffect(() => { fetchUserData(); }, [fetchUserData]);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 italic">Sincronizando Ecossistema...</span>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  // --- LÓGICA DE PERMISSÕES (RBAC) ---
  const role = String(user.role || '').toLowerCase();
  const isInternal = isInternalRole(role);
  const isCompany = isCompanyRole(role);
  const isDriver = isDriverRole(role);
  const isSuperAdmin = isSuperAdminRole(role);
  const isAdvertiser = role === 'advertiser';
  const hasAdsModule = isInternal || isCompany || isAdvertiser;

  // LÓGICA DE BLOQUEIO / ONBOARDING
  // Verifica se faltam dados essenciais para empresas
  const showOnboarding = isCompany && (!user.company_name || !user.document) && !hasDismissedOnboarding
  

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* OVERLAY DE ONBOARDING */}
      {showOnboarding && (
        <WelcomeOnboarding 
          user={user} 
          onClose={() => setHasDismissedOnboarding(true)}
          onComplete={(updatedData: Partial<User>) => {
            const newUser = { ...user, ...updatedData };
            setUser(newUser);
            authLogin(newUser);
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
            isInternal ? <DashboardHome user={user} /> : 
            isCompany ? <CompanyCommandCenter user={user} refreshUser={fetchUserData} /> : 
            isDriver ? <DriverView /> : 
            <Navigate to="profile" replace />
          } />

          {isInternal && getAdminRouteElements(user, isSuperAdmin)}

          {(isCompany || isInternal) && (
            <Route path="logistica" element={<FreightManager user={user} />} />
          )}

          {isCompany && (
            <>
              <Route path="company-pro" element={<CompanyProPage />} />
              <Route path="equipe" element={<TeamPage />} />
            </>
          )}

          {hasAdsModule && (
            <Route path="anunciante/*" element={<AdvertiserPortal user={user} />} />
          )}

          {/* Páginas para todos os usuários logados */}
          <Route path="planos" element={<PlansProvider><Outlet /></PlansProvider>}>
            <Route index element={<PlansPage />} />
            <Route path="freights" element={<FreightModule />} />
            <Route path="marketplace" element={<MarketplaceModule />} />
            <Route path="advertiser" element={<AdvertiserModule />} />
            <Route path="advertiser/avulso" element={<AvulsoPage />} />
            <Route path="driver" element={<DriverModule />} />
          </Route>
          <Route path="financeiro" element={<FinancialPage />} />
          <Route path="suporte" element={<SupportPage />} />
          <Route path="cotacoes" element={<QuotesPage />} />

          {/* Artigos do autor */}
          <Route path="meus-artigos" element={<MyArticlesPage />} />

          <Route path="profile" element={<MyProfile user={user} refreshUser={fetchUserData} />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:roomId" element={<ChatPage />} />
          <Route path="vendas" element={<MarketplaceManager user={user} />} />
          <Route path="marketplace" element={<MarketplaceManager user={user} />} />
          <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </div>
  );
}