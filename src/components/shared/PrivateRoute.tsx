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

  // 1. Se não estiver logado, redireciona para login salvando a página que tentou acessar
  if (!token || !user?.id) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Verificação de Permissão (Role)
  const userRole = user.role?.toLowerCase();
  if (allowedRoles) {
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
    if (!normalizedAllowed.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  // 3. Autorizado: Renderiza as rotas filhas
  return <Outlet />;
};