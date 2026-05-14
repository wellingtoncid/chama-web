interface AuthUser {
  role?: string;
  permissions?: string | Record<string, boolean>;
  [key: string]: unknown;
}

/**
 * Verifica se o usuário logado tem uma permissão específica
 */
export const hasPermission = (user: unknown, permissionKey: string): boolean => {
  if (!user) return false;

  const u = user as AuthUser;
  
  // Se o usuário for ADMIN e não tiver o campo permissions definido,
  // damos acesso total por segurança/padrão.
  if (u.role === 'admin' && (!u.permissions || u.permissions === "{}")) {
    return true;
  }

  try {
    // Caso as permissões venham como string do banco, tentamos o parse
    const perms = typeof u.permissions === 'string' 
      ? JSON.parse(u.permissions) 
      : u.permissions;
      
    return !!perms?.[permissionKey];
  } catch (e) {
    console.error("Erro ao processar permissões:", e);
    return false;
  }
};

export const getLoggedUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};