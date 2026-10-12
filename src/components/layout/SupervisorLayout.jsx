import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  LayoutDashboard, 
  CheckSquare, 
  BarChart3, 
  LogOut 
} from 'lucide-react';
import './Layout.css';

function SupervisorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="layout">
      <aside className="sidebar sidebar--supervisor">
        <div className="sidebar__header">
          <div className="sidebar__logo-badge">
            <Building2 size={22} />
          </div>
          <div className="sidebar__header-info">
            <h2>Padrón Social</h2>
            <span className="sidebar__rol-pill">Supervisor</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          <NavLink to="/supervisor" end>
            <span className="sidebar__nav-icon"><LayoutDashboard size={18} /></span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/supervisor/validacion">
            <span className="sidebar__nav-icon"><CheckSquare size={18} /></span>
            <span>Validación</span>
          </NavLink>
          <NavLink to="/supervisor/reportes">
            <span className="sidebar__nav-icon"><BarChart3 size={18} /></span>
            <span>Reportes</span>
          </NavLink>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user-profile">
            <div className="sidebar__avatar">
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="sidebar__user-details">
              <span className="sidebar__user-name">{user?.nombre || 'Supervisor'}</span>
              <span className="sidebar__user-role">Supervisor</span>
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

export default SupervisorLayout;
