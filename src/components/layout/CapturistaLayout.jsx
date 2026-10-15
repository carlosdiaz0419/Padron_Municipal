import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  LayoutDashboard, 
  ClipboardList, 
  UserPlus, 
  LogOut 
} from 'lucide-react';
import './Layout.css';

function CapturistaLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="layout layout--capturista">
      <aside className="sidebar sidebar--capturista">
        <div className="sidebar__header">
          <div className="sidebar__logo-badge">
            <Building2 size={22} />
          </div>
          <div className="sidebar__header-info">
            <h2>Padrón Social</h2>
            <span className="sidebar__rol-pill">Capturista</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          <NavLink to="/capturista" end>
            <span className="sidebar__nav-icon"><LayoutDashboard size={18} /></span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/capturista/beneficiarios">
            <span className="sidebar__nav-icon"><ClipboardList size={18} /></span>
            <span>Beneficiarios</span>
          </NavLink>
          <NavLink to="/capturista/beneficiarios/nuevo">
            <span className="sidebar__nav-icon"><UserPlus size={18} /></span>
            <span>Nuevo Registro</span>
          </NavLink>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user-profile">
            <div className="sidebar__avatar">
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="sidebar__user-details">
              <span className="sidebar__user-name" title={user?.nombre}>{user?.nombre || 'Capturista'}</span>
              <span className="sidebar__user-role">Capturista</span>
              <span className="sidebar__user-dependencia" title={user?.dependencia || 'Coordinación CEMTRI y Salud'}>
                <Building2 size={10} style={{ flexShrink: 0 }} /> {user?.dependencia || 'Coordinación CEMTRI y Salud'}
              </span>
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

export default CapturistaLayout;
