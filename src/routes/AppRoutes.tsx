import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '../components/shared/PrivateRoute';

// PÁGINAS PÚBLICAS
import HomePortal from '../pages/HomePortal';
import FreightPage from '../pages/FreightPage';
import GroupsList from '../pages/GroupsList';
import ProfileView from '../pages/public/ProfileView';
import CompanyProfile from '../pages/CompanyProfile';
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
import AdminPortal from '../pages/admin/AdminPortal';
import GroupsManagement from '../pages/admin/GroupsManagement';
import AdvertiserPortal from '../pages/advertiser/AdvertiserPortal';

// CHATS
import ChatList from '../pages/chat/ChatList'; 
import ChatRoom from '../pages/chat/ChatRoom';

// PAGAMENTO
import PaymentSuccess from '../pages/checkout/PaymentSuccess';
import PaymentFailure from '../pages/checkout/PaymentFailure';

export default function AppRoutes() {
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
      
      <Route path="/p/:slug" element={<ProfileView />} />
      <Route path="/empresa/:slug" element={<CompanyProfile />} /> 
      <Route path="/anuncie" element={<AdvertisingLandingPage />} />

      {/* --- ÁREA LOGADA (DRIVER, COMPANY, ADMIN) --- */}
      <Route element={<PrivateRoute allowedRoles={['driver', 'company', 'admin']} />}>
        
        {/* DASHBOARD CENTRAL: O '/*' é OBRIGATÓRIO aqui para as sub-rotas internas funcionarem */}
        <Route path="/dashboard/*" element={<DashboardPage />} />
        
        {/* Chats fora do Dashboard (Opcional) */}
        <Route path="/chat" element={<ChatList />} />
        <Route path="/chat/:roomId" element={<ChatRoom />} />

        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<PaymentFailure />} />
      </Route>

      {/* --- CRIAÇÃO E ANÚNCIOS --- */}
      <Route element={<PrivateRoute allowedRoles={['company', 'admin', 'partner']} />}>
        <Route path="/novo-frete" element={<CreateFreight />} />
        <Route path="/anunciante/*" element={<AdvertiserPortal />} />
      </Route>

      {/* --- ADMINISTRAÇÃO --- */}
      <Route element={<PrivateRoute allowedRoles={['admin', 'manager', 'analyst']} />}>
        <Route path="/admin/*" element={<AdminPortal />} />
        <Route path="/admin/groups" element={<GroupsManagement />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}