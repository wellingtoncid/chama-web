import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
  allowedRoles?: string[];
}

export const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const location = useLocation();
  const token = localStorage.getItem('@ChamaFrete:token');
  const storageUser = localStorage.getItem('@ChamaFrete:user');
  
  let user = null;
  try {
    user = storageUser ? JSON.parse(storageUser) : null;
  } catch (e) {
    user = null;
  }

  // 1. Se não estiver logado, redireciona para login
  if (!token || !user?.id) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Verificação de Permissão Híbrida (Role + Assinatura)
  const userRole = user.role?.toLowerCase();
  const isSubscriber = !!user.is_subscriber; // Converte 1/0 do banco para true/false

  if (allowedRoles) {
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
    
    // Verificamos se a rota exige acesso de anunciante
    const isAdvertiserRoute = normalizedAllowed.includes('advertiser');
    
    // O acesso é permitido se:
    // A) O cargo do usuário está na lista permitida
    // B) A rota é para anunciantes e o usuário tem assinatura ativa (mesmo sendo motorista/empresa)
    // C) O usuário é um administrador (sempre tem acesso)
    const hasRoleAccess = normalizedAllowed.includes(userRole);
    const hasSubscriptionAccess = isAdvertiserRoute && (isSubscriber || userRole === 'advertiser');
    const isAdmin = userRole === 'admin';

    if (!hasRoleAccess && !hasSubscriptionAccess && !isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  // 3. Autorizado: Renderiza as rotas filhas (Outlet)
  return <Outlet />;
};