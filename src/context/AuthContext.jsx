import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkPermission, syncPermissionsFromBackend } from '../services/permissions';

const VALID_ROLES = ['admin', 'supervisor', 'capturista'];

/**
 * AuthContext — Contexto global de autenticación con validación estricta de sesión y permisos.
 */
const AuthContext = createContext(null);

function isJwtExpired(token) {
  if (!token || typeof token !== 'string') return true;
  if (token.startsWith('local-jwt-')) return false;
  if (token.startsWith('mock-token')) return true;
  const parts = token.split('.');
  if (parts.length !== 3) return true;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    if (payload.exp && payload.exp * 1000 <= Date.now() + 5000) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setPermVersion] = useState(0);

  // Escuchar actualizaciones dinámicas de permisos y expiración 401 en vivo
  useEffect(() => {
    const handlePermUpdate = () => setPermVersion((v) => v + 1);
    const handleUnauthorized = () => {
      localStorage.removeItem('padrones_user');
      setUser(null);
    };
    window.addEventListener('padrones_permissions_updated', handlePermUpdate);
    window.addEventListener('storage', handlePermUpdate);
    window.addEventListener('padrones_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('padrones_permissions_updated', handlePermUpdate);
      window.removeEventListener('storage', handlePermUpdate);
      window.removeEventListener('padrones_unauthorized', handleUnauthorized);
    };
  }, []);

  // Al montar: recuperar sesión guardada y validar consistencia y vigencia del JWT
  useEffect(() => {
    const stored = localStorage.getItem('padrones_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const role = parsed?.rol?.toLowerCase?.();
        const token = parsed?.token || parsed?.jwt || parsed?.accessToken || parsed?.access_token;
        if (parsed && VALID_ROLES.includes(role) && !isJwtExpired(token)) {
          setUser({ ...parsed, rol: role, token });
          syncPermissionsFromBackend();
        } else {
          // Si el token ya expiró o los datos son inválidos, limpiar antes de montar vistas protegidas
          localStorage.removeItem('padrones_user');
          setUser(null);
        }
      } catch {
        localStorage.removeItem('padrones_user');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  /**
   * login — Almacena los datos del usuario tras autenticarse con la API.
   * @param {{ id, nombre, rol, token }} userData
   */
  const login = (userData) => {
    if (!userData) return;
    const role = (userData.rol || 'capturista').toLowerCase();
    const normalized = { ...userData, rol: role };
    setUser(normalized);
    localStorage.setItem('padrones_user', JSON.stringify(normalized));
    syncPermissionsFromBackend();
  };

  /**
   * logout — Elimina la sesión del usuario.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('padrones_user');
  };

  /**
   * hasPermission — Valida si el usuario actual tiene concedido un permiso específico.
   * @param {string} permissionId (ej. 'beneficiarios.eliminar')
   * @returns {boolean}
   */
  const hasPermission = (permissionId) => {
    return checkPermission(user, permissionId);
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!user && VALID_ROLES.includes(user?.rol),
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — Hook personalizado para acceder al contexto de autenticación.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
