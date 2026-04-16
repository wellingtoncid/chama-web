import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '../components/shared/PrivateRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { AdPopup } from '../components/shared/AdPopup';

// PÁGINAS PÚBLICAS
import HomePortal from '../pages/HomePortal';
import FreightPage from '../pages/FreightPage';
import GroupsList from '../pages/GroupsList';
import GroupDetail from '../pages/GroupDetail';
import ProfileView from '../pages/public/ProfileView';
import ReviewsPage from '../pages/public/ReviewsPage';
import AdvertisingLandingPage from '../pages/AdvertisingLandingPage';
import PublicidadePage from '../pages/PublicidadePage';
import HowItWorks from '../pages/HowItWorks';
import HowItWorksCompanies from '../pages/HowItWorksCompanies';
import HowItWorksDrivers from '../pages/HowItWorksDrivers';
import Marketplace from '../pages/marketplace/Marketplace'; 
import ListingDetails from '../pages/marketplace/ListingDetails';
import FreightDetails from '../pages/freights/FreightDetails';

// AUTH
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// INTERNAS
import DashboardPage from '../pages/DashboardPage';
import CreateFreight from '../pages/freights/CreateFreight';
import MatchingDriversPage from '../pages/freights/MatchingDriversPage';
import AdvertiserPortal from '../pages/advertiser/AdvertiserPortal';
import ListingFormPage from '../pages/marketplace/ListingFormPage';

// CHATS
import ChatList from '../pages/chat/ChatList'; 
import ChatRoom from '../pages/chat/ChatRoom';

// PAGAMENTO
import PaymentSuccess from '../pages/checkout/PaymentSuccess';
import PaymentFailure from '../pages/checkout/PaymentFailure';

// ADMIN - USUÁRIOS
import UsersManager from '../components/admin/UsersManagerView';
import UserCreate from '../components/admin/UserCreate';


export default function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  
  return (
    <>
    <AdPopup />
    
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

      {/* --- ÁREA LOGADA (Com Sidebar/DashboardLayout) --- */}
      <Route element={<PrivateRoute allowedRoles={['driver', 'company', 'admin', 'manager', 'support', 'finance', 'marketing', 'director', 'coordinator', 'supervisor']} />}>
        <Route element={<DashboardLayout user={user} />}>

          {/* Centralizador de Rotas Internas (Admin, BI, Perfil, etc) */}
          <Route path="/dashboard/*" element={<DashboardPage />} />

          <Route path="/dashboard/admin/usuarios" element={<UsersManager />} />
          <Route path="/dashboard/admin/usuarios/novo" element={<UserCreate />} />

          {/* CHAT: Dentro do Layout para manter a Sidebar */}
          <Route path="/chat" element={<ChatList />} />
          <Route path="/chat/:roomId" element={<ChatRoom />} />

          {/* CRIAR/EDITAR FRETE: Dentro do Layout */}
          <Route path="/novo-frete" element={<CreateFreight />} />

          {/* ENCONTRAR MOTORISTAS: Dentro do Layout */}
          <Route path="/encontrar-motoristas/:freightId" element={<MatchingDriversPage />} />

          {/* ANUNCIANTE: Acessível via sidebar/layout */}
          <Route path="/anunciante/*" element={<AdvertiserPortal user={user} />} />

          {/* MARKETPLACE: Criar/Editar Anúncio */}
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
    </Routes></>
  );
}
