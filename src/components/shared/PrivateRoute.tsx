import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
  allowedRoles?: string[];
}

export const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const location = useLocation();
  
  // Use sempre as mesmas constantes para não errar o nome da chave
  const STORAGE_TOKEN_KEY = '@ChamaFrete:token';
  const STORAGE_USER_KEY = '@ChamaFrete:user';

  const token = localStorage.getItem(STORAGE_TOKEN_KEY);
  const storageUser = localStorage.getItem(STORAGE_USER_KEY);
  
  let user = null;
  try {
    user = storageUser ? JSON.parse(storageUser) : null;
  } catch (e) {
    console.error("Erro ao processar dados do usuário no storage");
    user = null;
  }

  // 1. Bloqueio por falta de Token ou User
  if (!token || !user?.id) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = String(user.role || '').toLowerCase();
  
  // 2. Verificação de permissões
  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
    
    const isAdmin = userRole === 'admin';
    const isCompany = userRole === 'company' || userRole === 'transportadora' || userRole === 'advertiser';
    const isDriver = userRole === 'driver' || userRole === 'motorista';
    
    const hasRoleAccess = normalizedAllowed.includes(userRole) || 
                         (normalizedAllowed.includes('company') && isCompany) ||
                         (normalizedAllowed.includes('driver') && isDriver);

    if (!hasRoleAccess && !isAdmin) {
      const redirectPath = isCompany ? '/dashboard/company' : isDriver ? '/dashboard/driver' : '/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <Outlet />;
};