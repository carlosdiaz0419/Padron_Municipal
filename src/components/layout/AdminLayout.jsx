import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart3, 
  ShieldCheck, 
  LogOut 
} from 'lucide-react';
import './Layout.css';

/**
 * AdminLayout — Sidebar y contenedor para el Administrador con iconos Lucide y tema blanco.
 */
function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout layout--admin">
      <aside className="sidebar sidebar--admin">
        <div className="sidebar__header">
          <div className="sidebar__logo-badge">
            <Building2 size={22} />
          </div>
          <div className="sidebar__header-info">
            <h2>Padrón Social</h2>
            <span className="sidebar__rol-pill">Administrador</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          <NavLink to="/admin" end>
            <span className="sidebar__nav-icon"><LayoutDashboard size={18} /></span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/usuarios">
            <span className="sidebar__nav-icon"><Users size={18} /></span>
            <span>Usuarios</span>
          </NavLink>
          <NavLink to="/admin/catalogos">
            <span className="sidebar__nav-icon"><BookOpen size={18} /></span>
            <span>Catálogos</span>
          </NavLink>
          <NavLink to="/admin/reportes">
            <span className="sidebar__nav-icon"><BarChart3 size={18} /></span>
            <span>Reportes</span>
          </NavLink>
          <NavLink to="/admin/auditoria">
            <span className="sidebar__nav-icon"><ShieldCheck size={18} /></span>
            <span>Auditoría</span>
          </NavLink>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user-profile">
            <div className="sidebar__avatar">
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="sidebar__user-details">
              <span className="sidebar__user-name" title={user?.nombre}>{user?.nombre || 'Administrador'}</span>
              <span className="sidebar__user-role">Admin</span>
              <span className="sidebar__user-dependencia" title={user?.dependencia || 'Dirección General DIF'}>
                <Building2 size={10} style={{ flexShrink: 0 }} /> {user?.dependencia || 'Dirección General DIF'}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout" title="Cerrar Sesión">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
