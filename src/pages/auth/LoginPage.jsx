import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../services/api';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle,
  Shield,
  CheckCircle2,
  ClipboardEdit,
  Search,
  Loader2,
  Sparkles,
  KeyRound,
  Check,
  Building2
} from 'lucide-react';

import fondoImg from '../../assets/fondo.jpeg';
import ilustracionImg from '../../assets/Ilustracion.png';
import banerImg from '../../assets/baner.png';

import './LoginPage.css';

/**
 * LoginPage — Pantalla oficial de acceso al Sistema de Padrón de Beneficiarios Municipales.
 * 
 * Distribución institucional:
 * - Header (esquina superior izquierda): baner.png (PNG transparente oficial)
 * - Fondo completo: fondo.jpeg (Bordados tradicionales chiapanecos)
 * - Columna Izquierda (centrada): Títulos oficiales e Ilustración (Ilustracion.png transparente)
 * - Columna Derecha (centrada): Tarjeta blanca flotante de Iniciar Sesión
 * - Recursivo / Responsivo para computadoras y móviles.
 */
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ usuario: 'supervisor', password: '123' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const rolesDemo = [
    { label: 'Admin', user: 'admin', desc: 'Control Total', dependencia: 'Dirección General DIF', icon: Shield, theme: 'admin' },
    { label: 'Supervisor', user: 'supervisor', desc: 'Validación', dependencia: 'Dirección de Asistencia Social', icon: CheckCircle2, theme: 'supervisor' },
    { label: 'Capturista', user: 'capturista', desc: 'Registro', dependencia: 'Coordinación CEMTRI y Salud', icon: ClipboardEdit, theme: 'capturista' },
    { label: 'Consultor', user: 'consultor', desc: 'Solo Lectura', dependencia: 'Secretaría de Planeación', icon: Search, theme: 'consultor' },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSelectDemo = (usuario) => {
    setForm({ usuario, password: '123' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.usuario || !form.password) {
      setError('Por favor complete todos los campos.');
      return;
    }
    setLoading(true);
    try {
      const userData = await loginApi(form.usuario, form.password);
      login(userData);
      navigate(`/${userData.rol}`, { replace: true });
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="tuxtla-login-wrapper" 
      style={{ backgroundImage: `url(${fondoImg})` }}
    >
      {/* ── HEADER SUPERIOR IZQUIERDO ── */}
      <header className="tuxtla-header">
        <img 
          src={banerImg} 
          alt="Tuxtla Gutiérrez - Ayuntamiento 2024-2027 | Secretaría de Planeación" 
          className="tuxtla-header-logo" 
        />
      </header>

      {/* ── CONTENIDO PRINCIPAL EN 2 COLUMNAS CENTRADAS ── */}
      <main className="tuxtla-login-container">
        {/* COLUMNA IZQUIERDA: Títulos e Ilustración centrada */}
        <section className="login-left-section">
          <div className="login-titles-block">
            <h1 className="login-main-title">
              SISTEMA PADRÓN DE<br />
              BENEFICIARIOS MUNICIPALES
            </h1>
            <p className="login-subtitle-tag">
              SECRETARÍA DE PLANEACIÓN • AYUNTAMIENTO DE TUXTLA GUTIÉRREZ
            </p>
          </div>

          <div className="login-illustration-container">
            <img 
              src={ilustracionImg} 
              alt="Ilustración Institucional del Cañón del Sumidero y Beneficiarios" 
              className="login-illustration-img" 
            />
          </div>
        </section>

        {/* COLUMNA DERECHA: Tarjeta de Acceso centrada */}
        <section className="login-right-section">
          <div className="tuxtla-auth-card">
            <div className="card-top-accent"></div>

            <div className="card-header-block">
              <h2 className="card-login-title">Iniciar Sesión</h2>
              <p className="card-login-subtitle">Acceso al Sistema</p>
            </div>

            <form onSubmit={handleSubmit} className="tuxtla-auth-form">
              {error && (
                <div className="tuxtla-alert-error" role="alert">
                  <AlertCircle size={18} className="alert-icon" />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-input-group">
                <label htmlFor="usuario" className="field-label">Usuario</label>
                <div className="input-field-wrapper">
                  <User size={18} className="field-left-icon" />
                  <input
                    id="usuario"
                    name="usuario"
                    type="text"
                    value={form.usuario}
                    onChange={handleChange}
                    placeholder="Nombre de usuario"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="form-input-group">
                <label htmlFor="password" className="field-label">Contraseña</label>
                <div className="input-field-wrapper">
                  <Lock size={18} className="field-left-icon" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="field-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-tuxtla-submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin-loader" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Ingresar al Sistema</span>
                  </>
                )}
              </button>
            </form>

            <div className="demo-accounts-container">
              <div className="demo-accounts-header-wrap">
                <div className="demo-header-line"></div>
                <span className="demo-accounts-badge">
                  <Sparkles size={12} className="demo-badge-icon" />
                  Acceso Rápido Demo
                </span>
                <div className="demo-header-line"></div>
              </div>

              <div className="demo-roles-grid">
                {rolesDemo.map((r) => {
                  const Icon = r.icon;
                  const isSelected = form.usuario.toLowerCase() === r.user;
                  return (
                    <button
                      type="button"
                      key={r.user}
                      onClick={() => handleSelectDemo(r.user)}
                      className={`demo-role-card demo-role-${r.theme} ${isSelected ? 'is-selected' : ''}`}
                      title={`Autocompletar como ${r.label}`}
                    >
                      <div className="role-icon-box">
                        <Icon size={16} />
                      </div>
                      <div className="role-info-box">
                        <span className="role-name">{r.label}</span>
                        <span className="role-desc">{r.desc}</span>
                        <span style={{ fontSize: '0.67rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px', fontWeight: 500 }}>
                          <Building2 size={10} style={{ flexShrink: 0 }} /> {r.dependencia}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="role-check-indicator">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="demo-pwd-footer">
                <KeyRound size={13} className="pwd-key-icon" />
                <span>Contraseña demo:</span>
                <code className="demo-pwd-code">1234</code>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
