import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '../components/shared/PrivateRoute';

// PÁGINAS PÚBLICAS
import HomePortal from '../pages/HomePortal';
import FreightPage from '../pages/FreightPage';
import GroupsList from '../pages/GroupsList';
import ProfileView from '../pages/public/ProfileView';
import CompanyProfile from '../pages/CompanyProfile';
import AdvertisingLandingPage from '../pages/AdvertisingLandingPage';

// AUTH
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// INTERNAS
import Dashboard from '../pages/Dashboard';
import CreateFreight from '../pages/freights/CreateFreight';
import AdminPortal from '../pages/admin/AdminPortal';
import GroupsManagement from '../pages/admin/GroupsManagement';

export default function AppRoutes() {
  return (
    <Routes>
      {/* --- ROTAS PÚBLICAS --- */}
      <Route path="/" element={<HomePortal />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/fretes" element={<FreightPage />} />
      <Route path="/comunidade" element={<GroupsList />} />
      <Route path="/p/:slug" element={<ProfileView />} />
      <Route path="/empresa/:id" element={<CompanyProfile />} />
      <Route path="/anuncie" element={<AdvertisingLandingPage />} />

      {/* --- ROTAS PRIVADAS (GERAL) --- */}
      <Route element={<PrivateRoute allowedRoles={['driver', 'company', 'partner', 'advertiser', 'admin']} />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* --- ROTAS PRIVADAS (EMPRESAS / ADMIN) --- */}
      <Route element={<PrivateRoute allowedRoles={['company', 'admin', 'manager']} />}>
        <Route path="/novo-frete" element={<CreateFreight />} />
      </Route>

      {/* --- ROTAS PRIVADAS (ADMINISTRAÇÃO) --- */}
      <Route element={<PrivateRoute allowedRoles={['admin', 'manager', 'analyst']} />}>
        <Route path="/admin/*" element={<AdminPortal />} />
        <Route path="/admin/groups" element={<GroupsManagement />} />
      </Route>

      {/* --- FALLBACK --- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}