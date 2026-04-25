import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../api/api';

import CompanyCommandCenter from '../components/company/CompanyCommandCenter';
import DriverView from '../components/driver/DriverView';
import FreightManager from '../components/company/FreightManager';
import AdvertiserPortal from '../pages/advertiser/AdvertiserPortal';
import MyProfile from '../pages/profile/MyProfile';
import ChatList from './chat/ChatList';
import WelcomeOnboarding from '../components/profile/WelcomeOnboarding';

import PlansPage from './plans/PlansPage';
import CompanyProPage from './company/CompanyProPage';
import FinancialPage from './financial/FinancialPage';
import SupportPage from './support/SupportPage';
import QuotesPage from './quotes/QuotesPage';
import MarketplaceManager from '../modules/marketplace/MarketplaceManager';

import FreightsManagerView from '../components/admin/FreightManagerView';
import UsersManager from '../components/admin/UsersManagerView';
import GroupsManager from '../components/admin/GroupsManagement'; 
import AdsManager from '../components/admin/AdsManager'; 
import SettingsView from '../components/admin/SettingsView'; 
import AdminPortalRequests from '../components/admin/AdminPortalRequests';
import AdminFinancial from '../components/admin/AdminFinancial'; 
import PlansManager from '../components/admin/PlansManager';
import AdminDashboardActivity from '../components/admin/AdminDashboardActivity';
import PricingManager from '../components/admin/PricingManager';
import SupportTicketsManager from '../components/admin/SupportTicketsManager';
import QuotesManager from '../components/admin/QuotesManager';
import MarketplaceManagerAdmin from '../components/admin/MarketplaceManagerAdmin';
import ListingCategoriesManager from '../components/admin/ListingCategoriesManager';
import DashboardHome from '../components/admin/DashboardHome';
import DashboardBI from '../components/admin/DashboardBI';
import ProfileView from '../components/admin/ProfileView';
import AccessManager from '../components/admin/AccessManager';
import UserCreate from '../components/admin/UserCreate';
import RolesPage from './admin/RolesPage';
import ModulesPage from './admin/ModulesPage';
import ArticlesAdminPage from './admin/ArticlesAdminPage';
import AuthorRequestsAdminPage from './admin/AuthorRequestsAdminPage';
import MyArticlesPage from './MyArticlesPage';
import VerificationsManager from '../components/admin/VerificationsManager';
import ReviewsManager from '../components/admin/ReviewsManager';
import ReportsManager from '../components/admin/ReportsManager';
import AffiliateManager from '../components/admin/AffiliateManager';
import AuditLogsView from '../components/admin/AuditLogView';

import CommunityPlatform from './community/CommunityPlatform';
import TeamPage from './team/TeamPage';

interface User {
  role?: string;
  company_name?: string;
  document?: string;
  completion_score?: number;
  [key: string]: unknown;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [hasDismissedOnboarding, setHasDismissedOnboarding] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
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
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 401 || error.response?.status === 403) {
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
  const role = String(user.role || '').toLowerCase();
  
  // Internos (Staff)
  const isSuperAdmin = role === 'admin';
  const isInternal = ['admin', 'manager', 'support', 'finance', 'marketing', 'director', 'coordinator', 'supervisor'].includes(role);
  
  // Externos (Clientes)
  const isCompany = role === 'company';
  const isDriver = role === 'driver';
  
  // Módulos Contratados
  const hasAdsModule = isInternal || isCompany;

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
            isInternal ? <DashboardHome user={user} /> : 
            isCompany ? <CompanyCommandCenter user={user} refreshUser={fetchUserData} /> : 
            isDriver ? <DriverView /> : 
            <Navigate to="profile" replace />
          } />

          {isInternal && (
            <>
              <Route path="admin/bi" element={<DashboardBI user={user} />} />
              <Route path="admin/inicio" element={<DashboardHome user={user} />} />
              <Route path="admin/auditoria" element={<AuditLogsView />} />
              <Route path="admin/cargas" element={<FreightsManagerView />} />
              <Route path="admin/usuarios" element={<UsersManager />} />
              {isSuperAdmin && <Route path="admin/usuarios/novo" element={<UserCreate />} />}
              <Route path="admin/comunidades" element={<GroupsManager />} />
              <Route path="admin/financeiro" element={<AdminFinancial />} />
              <Route path="admin/publicidade" element={<AdsManager />} />
              <Route path="admin/leads" element={<AdminPortalRequests />} />
              <Route path="admin/artigos" element={<ArticlesAdminPage />} />
              <Route path="admin/autores" element={<AuthorRequestsAdminPage />} />
              <Route path="admin/cotacoes" element={<QuotesManager />} />
              <Route path="admin/marketplace" element={<MarketplaceManagerAdmin />} />
              <Route path="admin/marketplace-categorias" element={<ListingCategoriesManager />} />
              <Route path="admin/configuracoes" element={<SettingsView />} />
              
              <Route path="admin/suporte" element={<SupportTicketsManager />} />
              {isSuperAdmin && <Route path="admin/planos" element={<PlansManager />} />}
              {isSuperAdmin && <Route path="admin/precificacao" element={<PricingManager />} />}
              {isSuperAdmin && <Route path="admin/acessos" element={<AccessManager />} />}
              {isSuperAdmin && <Route path="admin/cargos" element={<RolesPage />} />}
              {isSuperAdmin && <Route path="admin/modulos" element={<ModulesPage />} />}
              <Route path="admin/verificacoes" element={<VerificationsManager />} />
              <Route path="admin/avaliacoes" element={<ReviewsManager />} />
              <Route path="admin/denuncias" element={<ReportsManager />} />
              {isSuperAdmin && <Route path="admin/afiliados" element={<AffiliateManager />} />}
              <Route path="perfil" element={<ProfileView />} />
            </>
          )}

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
          <Route path="planos" element={<PlansPage />} />
          <Route path="financeiro" element={<FinancialPage />} />
          <Route path="suporte" element={<SupportPage />} />
          <Route path="cotacoes" element={<QuotesPage />} />

          {/* Artigos do autor */}
          <Route path="meus-artigos" element={<MyArticlesPage />} />

          <Route path="profile" element={<MyProfile user={user} refreshUser={fetchUserData} />} />
          <Route path="chat" element={<ChatList />} />
          <Route path="vendas" element={<MarketplaceManager user={user} />} />
          <Route path="marketplace" element={<MarketplaceManager user={user} />} />
          <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </div>
  );
}