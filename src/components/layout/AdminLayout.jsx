import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  LayoutDashboard, 
  ClipboardList,
  Users, 
  BookOpen, 
  BarChart3, 
  ShieldCheck, 
  LogOut,
  KeyRound,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Menu
} from 'lucide-react';
import './Layout.css';

/**
 * AdminLayout — Sidebar y contenedor para el Administrador con soporte responsivo móvil/tablet/desktop.
 */
function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSelfPwdModal, setShowSelfPwdModal] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selfPwdToast, setSelfPwdToast] = useState(null);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleSelfPasswordSubmit = (e) => {
    e.preventDefault();
    if (!newPwd || !confirmPwd) {
      alert('Por favor complete todos los campos.');
      return;
    }
    if (newPwd.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPwd !== confirmPwd) {
      alert('La confirmación de la contraseña no coincide.');
      return;
    }

    setSelfPwdToast('¡Tu contraseña ha sido actualizada con éxito!');
    setTimeout(() => {
      setSelfPwdToast(null);
      setShowSelfPwdModal(false);
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    }, 2000);
  };

  const handleLogout = () => {
    closeMobileMenu();
    logout();
    navigate('/login');
  };

  return (
    <div className="layout layout--admin">
      {/* ── BARRA SUPERIOR MÓVIL / TABLET ── */}
      <header className="mobile-topbar mobile-topbar--admin">
        <div className="mobile-topbar__brand">
          <div className="sidebar__logo-badge">
            <Building2 size={20} />
          </div>
          <div className="sidebar__header-info">
            <h2>Padrón Social</h2>
            <span className="sidebar__rol-pill">Administrador</span>
          </div>
        </div>
        <button
          type="button"
          className="mobile-topbar__toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ── OVERLAY MÓVIL ── */}
      {mobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={closeMobileMenu} aria-hidden="true" />
      )}

      <aside className={`sidebar sidebar--admin ${mobileMenuOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo-badge">
            <Building2 size={22} />
          </div>
          <div className="sidebar__header-info">
            <h2>Padrón Social</h2>
            <span className="sidebar__rol-pill">Administrador</span>
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

        <nav className="sidebar__nav">
          <NavLink to="/admin" end onClick={closeMobileMenu}>
            <span className="sidebar__nav-icon"><LayoutDashboard size={18} /></span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/beneficiarios" onClick={closeMobileMenu}>
            <span className="sidebar__nav-icon"><ClipboardList size={18} /></span>
            <span>Padrón de Beneficiarios</span>
          </NavLink>
          <NavLink to="/admin/usuarios" onClick={closeMobileMenu}>
            <span className="sidebar__nav-icon"><Users size={18} /></span>
            <span>Usuarios y Permisos</span>
          </NavLink>
          <NavLink to="/admin/catalogos" onClick={closeMobileMenu}>
            <span className="sidebar__nav-icon"><BookOpen size={18} /></span>
            <span>Catálogos</span>
          </NavLink>
          <NavLink to="/admin/reportes" onClick={closeMobileMenu}>
            <span className="sidebar__nav-icon"><BarChart3 size={18} /></span>
            <span>Reportes</span>
          </NavLink>
          <NavLink to="/admin/auditoria" onClick={closeMobileMenu}>
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
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <button 
              onClick={() => { closeMobileMenu(); setShowSelfPwdModal(true); }} 
              className="btn-logout" 
              title="Cambiar mi contraseña de Administrador"
              style={{ color: '#2563eb' }}
            >
              <KeyRound size={16} />
            </button>
            <button onClick={handleLogout} className="btn-logout" title="Cerrar Sesión">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MODAL: CAMBIAR MI PROPIA CONTRASEÑA ── */}
      {showSelfPwdModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <KeyRound size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Cambiar Mi Contraseña
                </h3>
              </div>
              <button 
                onClick={() => setShowSelfPwdModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            {selfPwdToast ? (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                <CheckCircle2 size={42} style={{ color: '#10b981', margin: '0 auto 0.75rem' }} />
                <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>{selfPwdToast}</h4>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Tu nueva clave ha sido guardada.</p>
              </div>
            ) : (
              <form onSubmit={handleSelfPasswordSubmit} style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Contraseña Actual
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Nueva Contraseña *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 2.5rem 0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Confirmar Nueva Contraseña *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repita la nueva contraseña"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowSelfPwdModal(false)}
                    className="btn-sm"
                    style={{ padding: '0.6rem 1rem', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ padding: '0.6rem 1.25rem', cursor: 'pointer' }}
                  >
                    Guardar Contraseña
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
