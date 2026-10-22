import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  LayoutDashboard, 
  ClipboardList,
  CheckSquare, 
  BarChart3, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import './Layout.css';

function SupervisorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="layout layout--supervisor">
      {/* ── BARRA SUPERIOR MÓVIL / TABLET ── */}
      <header className="mobile-topbar mobile-topbar--supervisor">
        <div className="mobile-topbar__brand">
          <div className="sidebar__logo-badge">
            <Building2 size={20} />
          </div>
          <div className="sidebar__header-info">
            <h2>Padrón Social</h2>
            <span className="sidebar__rol-pill">Supervisor</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => { closeMobileMenu(); logout(); navigate('/login'); }}
            className="btn-logout"
            title="Cerrar Sesión"
          >
            <LogOut size={16} />
          </button>
          <button
            type="button"
            className="mobile-topbar__toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── OVERLAY MÓVIL ── */}
      {mobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={closeMobileMenu} aria-hidden="true" />
      )}

      <aside className={`sidebar sidebar--supervisor ${mobileMenuOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo-badge">
            <Building2 size={22} />
          </div>
          <div className="sidebar__header-info">
            <h2>Padrón Social</h2>
            <span className="sidebar__rol-pill">Supervisor</span>
          </div>
          <button
            type="button"
            className="sidebar__close-btn"
            onClick={closeMobileMenu}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── PERFIL Y BOTÓN CERRAR SESIÓN ARRIBA EN EL MENÚ ── */}
        <div className="sidebar__user-top">
          <div className="sidebar__user-profile">
            <div className="sidebar__avatar">
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="sidebar__user-details">
              <span className="sidebar__user-name" title={user?.nombre}>{user?.nombre || 'Supervisor'}</span>
              <span className="sidebar__user-role">Supervisor</span>
              <span className="sidebar__user-dependencia" title={user?.dependencia || 'Dirección de Asistencia Social'}>
                <Building2 size={10} style={{ flexShrink: 0 }} /> {user?.dependencia || 'Dirección de Asistencia Social'}
              </span>
            </div>
          </div>
          <button onClick={() => { closeMobileMenu(); logout(); navigate('/login'); }} className="btn-logout" title="Cerrar Sesión">
            <LogOut size={16} />
          </button>
        </div>

        <nav className="sidebar__nav">
          <NavLink to="/supervisor" end onClick={closeMobileMenu}>
            <span className="sidebar__nav-icon"><LayoutDashboard size={18} /></span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/supervisor/beneficiarios" onClick={closeMobileMenu}>
            <span className="sidebar__nav-icon"><ClipboardList size={18} /></span>
            <span>Padrón de Beneficiarios</span>
          </NavLink>
          <NavLink to="/supervisor/validacion" onClick={closeMobileMenu}>
            <span className="sidebar__nav-icon"><CheckSquare size={18} /></span>
            <span>Validación</span>
          </NavLink>
          <NavLink to="/supervisor/reportes" onClick={closeMobileMenu}>
            <span className="sidebar__nav-icon"><BarChart3 size={18} /></span>
            <span>Reportes</span>
          </NavLink>
        </nav>
      </aside>

      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  );
}

export default SupervisorLayout;
