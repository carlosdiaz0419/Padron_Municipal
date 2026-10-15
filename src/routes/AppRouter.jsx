import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Páginas de autenticación
import LoginPage from '../pages/auth/LoginPage';

// Layouts por rol
import AdminLayout from '../components/layout/AdminLayout';
import SupervisorLayout from '../components/layout/SupervisorLayout';
import CapturistaLayout from '../components/layout/CapturistaLayout';

// Páginas — Admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsuarios from '../pages/admin/AdminUsuarios';
import AdminCatalogos from '../pages/admin/AdminCatalogos';
import AdminReportes from '../pages/admin/AdminReportes';
import AdminAuditoria from '../pages/admin/AdminAuditoria';

// Páginas — Supervisor
import SupervisorDashboard from '../pages/supervisor/SupervisorDashboard';
import SupervisorValidacion from '../pages/supervisor/SupervisorValidacion';
import SupervisorReportes from '../pages/supervisor/SupervisorReportes';

// Páginas — Capturista
import CapturistaDashboard from '../pages/capturista/CapturistaDashboard';
import CapturistaBeneficiarios from '../pages/capturista/CapturistaBeneficiarios';
import CapturistaFormulario from '../pages/capturista/CapturistaFormulario';

// Componentes de protección de rutas
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

const VALID_ROLES = ['admin', 'supervisor', 'capturista'];

/**
 * AppRouter — Define toda la estructura de rutas de la aplicación de forma determinista y segura.
 */
function AppRouter() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b1d3a', color: '#ffffff' }}>
        Cargando sistema...
      </div>
    );
  }

  const role = user?.rol?.toLowerCase();
  const isValidSession = isAuthenticated && user && VALID_ROLES.includes(role);
  const homePath = isValidSession ? `/${role}` : '/login';

  return (
    <Routes>
      {/* ── RUTA PÚBLICA ─────────────────────────────────────────── */}
      <Route
        path="/login"
        element={isValidSession ? <Navigate to={homePath} replace /> : <LoginPage />}
      />

      {/* ── ADMIN ────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
            <Route path="catalogos" element={<AdminCatalogos />} />
            <Route path="reportes" element={<AdminReportes />} />
            <Route path="auditoria" element={<AdminAuditoria />} />
          </Route>
        </Route>
      </Route>

      {/* ── SUPERVISOR ───────────────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['supervisor']} />}>
          <Route path="/supervisor" element={<SupervisorLayout />}>
            <Route index element={<SupervisorDashboard />} />
            <Route path="validacion" element={<SupervisorValidacion />} />
            <Route path="reportes" element={<SupervisorReportes />} />
          </Route>
        </Route>
      </Route>

      {/* ── CAPTURISTA ───────────────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['capturista']} />}>
          <Route path="/capturista" element={<CapturistaLayout />}>
            <Route index element={<CapturistaDashboard />} />
            <Route path="beneficiarios" element={<CapturistaBeneficiarios />} />
            <Route path="beneficiarios/nuevo" element={<CapturistaFormulario />} />
            <Route path="beneficiarios/editar/:id" element={<CapturistaFormulario />} />
          </Route>
        </Route>
      </Route>

      {/* ── REDIRECCIÓN RAÍZ Y RUTAS NO ENCONTRADAS ──────────────── */}
      <Route path="/" element={<Navigate to={homePath} replace />} />
      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  );
}

export default AppRouter;
