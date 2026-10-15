import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleRoute — Bloquea el acceso a rutas si el usuario no tiene el rol requerido.
 * Si el usuario no tiene el permiso solicitado, lo redirige de inmediato a su propio panel,
 * evitando cualquier rebote o bucle infinito con la raíz "/".
 */
function RoleRoute({ allowedRoles }) {
  const { user } = useAuth();
  const userRole = user?.rol?.toLowerCase();

  if (!user || !userRole) {
    return <Navigate to="/login" replace />;
  }

  const hasPermission = allowedRoles.includes(userRole);
  return hasPermission ? <Outlet /> : <Navigate to={`/${userRole}`} replace />;
}

export default RoleRoute;
