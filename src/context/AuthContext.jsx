import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkPermission } from '../services/permissions';

const VALID_ROLES = ['admin', 'supervisor', 'capturista'];

/**
 * AuthContext — Contexto global de autenticación con validación estricta de sesión y permisos.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setPermVersion] = useState(0);

  // Escuchar actualizaciones dinámicas de permisos en vivo
  useEffect(() => {
    const handlePermUpdate = () => setPermVersion((v) => v + 1);
    window.addEventListener('padrones_permissions_updated', handlePermUpdate);
    return () => window.removeEventListener('padrones_permissions_updated', handlePermUpdate);
  }, []);

  // Al montar: recuperar sesión guardada y validar consistencia
  useEffect(() => {
    const stored = localStorage.getItem('padrones_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const role = parsed?.rol?.toLowerCase?.();
        if (parsed && VALID_ROLES.includes(role)) {
          setUser({ ...parsed, rol: role });
        } else {
          // Si los datos guardados en localStorage son inválidos o no tienen rol reconocido, limpiar
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
