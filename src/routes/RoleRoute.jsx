import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleRoute — Bloquea el acceso a rutas si el usuario no tiene el rol requerido.
 *
 * @param {{ allowedRoles: string[] }} props
 *   allowedRoles: lista de roles que tienen permiso para acceder a la ruta.
 *
 * Redirige a "/" (que a su vez redirige al área del rol del usuario)
 * si el rol no coincide.
 */
function RoleRoute({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const hasPermission = allowedRoles.includes(user.rol);
  return hasPermission ? <Outlet /> : <Navigate to="/" replace />;
}

export default RoleRoute;
