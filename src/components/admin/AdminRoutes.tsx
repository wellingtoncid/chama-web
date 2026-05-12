import { Route } from 'react-router-dom';

interface User {
  id: number;
  role?: string;
  [key: string]: unknown;
}

import FreightsManagerView from '@/components/admin/FreightManagerView';
import UsersManager from '@/components/admin/UsersManagerView';
import GroupsManager from '@/components/admin/GroupsManagement';
import AdsManager from '@/components/admin/AdsManager';
import SettingsView from '@/components/admin/SettingsView';
import AdminPortalRequests from '@/components/admin/AdminPortalRequests';
import AdminFinancial from '@/components/admin/AdminFinancial';
import PlansManager from '@/components/admin/PlansManager';
import PricingManager from '@/components/admin/PricingManager';
import SupportTicketsManager from '@/components/admin/SupportTicketsManager';
import QuotesManager from '@/components/admin/QuotesManager';
import MarketplaceManagerAdmin from '@/components/admin/MarketplaceManagerAdmin';
import ListingCategoriesManager from '@/components/admin/ListingCategoriesManager';
import DashboardHome from '@/components/admin/DashboardHome';
import DashboardBI from '@/components/admin/DashboardBI';
import ProfileView from '@/components/admin/ProfileView';
import AccessManager from '@/components/admin/AccessManager';
import UserEditorPage from '@/pages/admin/UserEditorPage';
import RolesPage from '@/pages/admin/RolesPage';
import ModulesPage from '@/pages/admin/ModulesPage';
import ArticlesAdminPage from '@/pages/admin/ArticlesAdminPage';
import AuthorRequestsAdminPage from '@/pages/admin/AuthorRequestsAdminPage';
import VerificationsManager from '@/components/admin/VerificationsManager';
import ReviewsManager from '@/components/admin/ReviewsManager';
import ReportsManager from '@/components/admin/ReportsManager';
import AffiliateManager from '@/components/admin/AffiliateManager';
import AuditLogsView from '@/components/admin/AuditLogView';

export function getAdminRouteElements(user: User, isSuperAdmin: boolean) {
  return (
    <>
      <Route path="admin/bi" element={<DashboardBI user={user} />} />
      <Route path="admin/inicio" element={<DashboardHome user={user} />} />
      <Route path="admin/auditoria" element={<AuditLogsView />} />
      <Route path="admin/cargas" element={<FreightsManagerView />} />
      <Route path="admin/usuarios" element={<UsersManager />} />
      {isSuperAdmin && <Route path="admin/usuarios/novo" element={<UserEditorPage />} />}
      {isSuperAdmin && <Route path="admin/usuarios/:id" element={<UserEditorPage />} />}
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
  );
}
