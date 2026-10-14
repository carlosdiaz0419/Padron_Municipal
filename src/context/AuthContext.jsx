import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext — Contexto global de autenticación.
 *
 * Proporciona:
 *   - user: objeto del usuario autenticado (nombre, rol, token)
 *   - login(userData): guarda la sesión en localStorage y en el estado
 *   - logout(): limpia la sesión
 *   - isAuthenticated: boolean rápido para verificar si hay sesión activa
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar: recuperar sesión guardada
  useEffect(() => {
    const stored = localStorage.getItem('padrones_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('padrones_user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * login — Almacena los datos del usuario tras autenticarse con la API.
   * @param {{ id, nombre, rol, token }} userData
   */
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('padrones_user', JSON.stringify(userData));
  };

  /**
   * logout — Elimina la sesión del usuario.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('padrones_user');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
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
