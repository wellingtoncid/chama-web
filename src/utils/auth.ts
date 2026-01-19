/**
 * Verifica se o usuário logado tem uma permissão específica
 */
export const hasPermission = (user: any, permissionKey: string): boolean => {
  if (!user) return false;
  
  // Se o usuário for ADMIN e não tiver o campo permissions definido,
  // damos acesso total por segurança/padrão.
  if (user.role === 'admin' && (!user.permissions || user.permissions === "{}")) {
    return true;
  }

  try {
    // Caso as permissões venham como string do banco, tentamos o parse
    const perms = typeof user.permissions === 'string' 
      ? JSON.parse(user.permissions) 
      : user.permissions;
      
    return !!perms?.[permissionKey];
  } catch (e) {
    console.error("Erro ao processar permissões:", e);
    return false;
  }
};