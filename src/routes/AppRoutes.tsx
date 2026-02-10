import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '../components/shared/PrivateRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';

// PÁGINAS PÚBLICAS
import HomePortal from '../pages/HomePortal';
import FreightPage from '../pages/FreightPage';
import GroupsList from '../pages/GroupsList';
import ProfileView from '../pages/public/ProfileView';
import AdvertisingLandingPage from '../pages/AdvertisingLandingPage';
import Marketplace from '../pages/marketplace/Marketplace'; 
import FreightDetails from '../pages/freights/FreightDetails';

// AUTH
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// INTERNAS
import DashboardPage from '../pages/DashboardPage';
import CreateFreight from '../pages/freights/CreateFreight';
import AdvertiserPortal from '../pages/advertiser/AdvertiserPortal';

// CHATS
import ChatList from '../pages/chat/ChatList'; 
import ChatRoom from '../pages/chat/ChatRoom';

// PAGAMENTO
import PaymentSuccess from '../pages/checkout/PaymentSuccess';
import PaymentFailure from '../pages/checkout/PaymentFailure';

export default function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  
  return (
    <Routes>
      {/* --- PÚBLICAS --- */}
      <Route path="/" element={<HomePortal />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      <Route path="/fretes" element={<FreightPage />} />
      <Route path="/frete/:slug" element={<FreightDetails />} /> 

      <Route path="/comunidade" element={<GroupsList />} />
      <Route path="/marketplace" element={<Marketplace />} /> 
      
      <Route path="/driver/:slug" element={<ProfileView />} />
      <Route path="/company/:slug" element={<ProfileView />} /> 
      <Route path="/anuncie" element={<AdvertisingLandingPage />} />

      {/* --- ÁREA LOGADA (Com Sidebar/DashboardLayout) --- */}
      <Route element={<PrivateRoute allowedRoles={['driver', 'company', 'admin', 'manager', 'partner', 'superadmin', 'shipper']} />}>
        <Route element={<DashboardLayout user={user} />}>
          
          {/* Centralizador de Rotas Internas (Admin, BI, Perfil, etc) */}
          <Route path="/dashboard/*" element={<DashboardPage />} />
         
          {/* CHAT: Dentro do Layout para manter a Sidebar */}
          <Route path="/chat" element={<ChatList />} />
          <Route path="/chat/:roomId" element={<ChatRoom />} />

          {/* ANUNCIANTE: Acessível via sidebar/layout */}
          <Route path="/anunciante/*" element={<AdvertiserPortal user={user} />} />
        </Route>
      </Route>

      {/* --- ROTAS ESPECÍFICAS (Sem Sidebar / Foco Total) --- */}
      
      {/* Criar Frete: APENAS Empresa, Admin e Shipper (Driver não entra aqui) */}
      <Route element={<PrivateRoute allowedRoles={['company', 'admin', 'superadmin', 'shipper']} />}>
        <Route path="/novo-frete" element={<CreateFreight />} />
      </Route>

      {/* Pagamentos */}
      <Route element={<PrivateRoute allowedRoles={['driver', 'company', 'admin', 'shipper']} />}>
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<PaymentFailure />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}
