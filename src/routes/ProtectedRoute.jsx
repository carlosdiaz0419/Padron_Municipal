import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — Bloquea el acceso a rutas si el usuario no está autenticado.
 * Redirige a /login de inmediato si no hay sesión activa válida.
 */
function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth();
  return (isAuthenticated && user?.rol) ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
