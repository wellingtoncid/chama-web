import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '../components/shared/PrivateRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { AdPopup } from '../components/shared/AdPopup';

const HomePortal = lazy(() => import('../pages/HomePortal'));
const FreightPage = lazy(() => import('../pages/FreightPage'));
const GroupsList = lazy(() => import('../pages/GroupsList'));
const GroupDetail = lazy(() => import('../pages/GroupDetail'));
const ProfileView = lazy(() => import('../pages/public/ProfileView'));
const ReviewsPage = lazy(() => import('../pages/public/ReviewsPage'));
const AdvertisingLandingPage = lazy(() => import('../pages/AdvertisingLandingPage'));
const PublicidadePage = lazy(() => import('../pages/PublicidadePage'));
const HowItWorks = lazy(() => import('../pages/HowItWorks'));
const HowItWorksCompanies = lazy(() => import('../pages/HowItWorksCompanies'));
const HowItWorksDrivers = lazy(() => import('../pages/HowItWorksDrivers'));
const Marketplace = lazy(() => import('../pages/marketplace/Marketplace'));
const ListingDetails = lazy(() => import('../pages/marketplace/ListingDetails'));
const FreightDetails = lazy(() => import('../pages/freights/FreightDetails'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const CreateFreight = lazy(() => import('../pages/freights/CreateFreight'));
const MatchingDriversPage = lazy(() => import('../pages/freights/MatchingDriversPage'));
const AdvertiserPortal = lazy(() => import('../pages/advertiser/AdvertiserPortal'));
const ListingFormPage = lazy(() => import('../pages/marketplace/ListingFormPage'));
const ArticlesPage = lazy(() => import('../pages/ArticlesPage'));
const ArticleDetailPage = lazy(() => import('../pages/ArticleDetailPage'));
const ArticleSubmitPage = lazy(() => import('../pages/ArticleSubmitPage'));
const AuthorRequestPage = lazy(() => import('../pages/AuthorRequestPage'));
const ChatList = lazy(() => import('../pages/chat/ChatList'));
const ChatRoom = lazy(() => import('../pages/chat/ChatRoom'));
const PaymentSuccess = lazy(() => import('../pages/checkout/PaymentSuccess'));
const PaymentFailure = lazy(() => import('../pages/checkout/PaymentFailure'));
const UsersManager = lazy(() => import('../components/admin/UsersManagerView'));
const UserEditorPage = lazy(() => import('../pages/admin/UserEditorPage'));
const ArticlesAdminPage = lazy(() => import('../pages/admin/ArticlesAdminPage'));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-orange-500 rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4">Carregando...</p>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <RouteFallback />;
  
  return (
    <>
    <AdPopup />
    
    <Suspense fallback={<RouteFallback />}>
    <Routes>
      {/* --- PÚBLICAS --- */}
      <Route path="/" element={<HomePortal />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/fretes" element={<FreightPage />} />
      <Route path="/frete/:slug" element={<FreightDetails />} />

      <Route path="/comunidade" element={<GroupsList />} />
      <Route path="/grupo/:id" element={<GroupDetail />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/anuncio/:slug" element={<ListingDetails />} />

      <Route path="/driver/:slug" element={<ProfileView />} />
      <Route path="/company/:slug" element={<ProfileView />} />
      <Route path="/perfil/:slug" element={<ProfileView />} />
      <Route path="/avaliacoes/:slug" element={<ReviewsPage />} />
      <Route path="/anuncie" element={<AdvertisingLandingPage />} />
      <Route path="/seja-visto" element={<AdvertisingLandingPage />} />
      <Route path="/publicidade" element={<PublicidadePage />} />
      <Route path="/como-funciona" element={<HowItWorks />} />
      <Route path="/como-funciona/empresas" element={<HowItWorksCompanies />} />
      <Route path="/como-funciona/motoristas" element={<HowItWorksDrivers />} />

      {/* --- ARTIGOS (PÚBLICOS) --- */}
      <Route path="/artigos" element={<ArticlesPage />} />
      <Route path="/artigos/:slug" element={<ArticleDetailPage />} />
      <Route path="/artigos/submeter" element={<ArticleSubmitPage />} />
      <Route path="/artigos/ser-autor" element={<AuthorRequestPage />} />

      {/* --- ÁREA LOGADA (Com Sidebar/DashboardLayout) --- */}
      <Route element={<PrivateRoute allowedRoles={['driver', 'company', 'admin', 'manager', 'support', 'finance', 'marketing', 'director', 'coordinator', 'supervisor']} />}>
        <Route element={<DashboardLayout user={user} />}>

          {/* Centralizador de Rotas Internas */}
          <Route path="/dashboard/*" element={<DashboardPage />} />

          <Route path="/dashboard/admin/usuarios" element={<UsersManager />} />
          <Route path="/dashboard/admin/usuarios/novo" element={<UserEditorPage />} />
          <Route path="/dashboard/admin/usuarios/:id" element={<UserEditorPage />} />

          {/* CHAT */}
          <Route path="/chat" element={<ChatList />} />
          <Route path="/chat/:roomId" element={<ChatRoom />} />

          {/* CRIAR/EDITAR FRETE */}
          <Route path="/novo-frete" element={<CreateFreight />} />

          {/* ENCONTRAR MOTORISTAS */}
          <Route path="/encontrar-motoristas/:freightId" element={<MatchingDriversPage />} />

          {/* ANUNCIANTE */}
          <Route path="/anunciante/*" element={<AdvertiserPortal user={user} />} />

          {/* MARKETPLACE */}
          <Route path="/novo-anuncio" element={<ListingFormPage />} />
          <Route path="/editar-anuncio/:id" element={<ListingFormPage />} />
        </Route>
      </Route>

          {/* Pagamentos */}
          <Route element={<PrivateRoute allowedRoles={['driver', 'company', 'admin']} />}>
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
          </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
    </Routes>
    </Suspense></>
  );
}
