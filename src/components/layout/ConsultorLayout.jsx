import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  LayoutDashboard, 
  Search, 
  LogOut 
} from 'lucide-react';
import './Layout.css';

function ConsultorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="layout">
      <aside className="sidebar sidebar--consultor">
        <div className="sidebar__header">
          <div className="sidebar__logo-badge">
            <Building2 size={22} />
          </div>
          <div className="sidebar__header-info">
            <h2>Padrón Social</h2>
            <span className="sidebar__rol-pill">Consultor</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          <NavLink to="/consultor" end>
            <span className="sidebar__nav-icon"><LayoutDashboard size={18} /></span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/consultor/busqueda">
            <span className="sidebar__nav-icon"><Search size={18} /></span>
            <span>Búsqueda</span>
          </NavLink>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user-profile">
            <div className="sidebar__avatar">
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="sidebar__user-details">
              <span className="sidebar__user-name">{user?.nombre || 'Consultor'}</span>
              <span className="sidebar__user-role">Consultor</span>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="btn-logout" title="Cerrar Sesión">
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

export default ConsultorLayout;
