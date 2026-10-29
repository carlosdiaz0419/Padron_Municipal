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
  Loader2,
  ShieldCheck,
  Building2,
  ArrowRight
} from 'lucide-react';

import fondoImg from '../../assets/fondo.jpeg';
import ilustracionImg from '../../assets/Ilustracion.png';
import banerImg from '../../assets/baner-blanco.png';

import './LoginPage.css';

/**
 * LoginPage — Pantalla oficial de acceso al Sistema de Padrón de Beneficiarios Municipales.
 * 
 * Distribución institucional:
 * - Header (esquina superior izquierda): baner.png (PNG transparente oficial)
 * - Fondo completo: fondo.jpeg (Bordados tradicionales chiapanecos) con overlay institucional
 * - Columna Izquierda (centrada): Títulos oficiales e Ilustración (Ilustracion.png transparente)
 * - Columna Derecha (centrada): Tarjeta de acceso premium con elevación, insignias de seguridad y pie institucional
 * - Responsivo para computadoras, tablets y móviles.
 */
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ usuario: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

        {/* COLUMNA DERECHA: Tarjeta de Acceso Profesional */}
        <section className="login-right-section">
          <div className="tuxtla-auth-card">
            {/* Franja superior institucional con degradado Chiapas */}
            <div className="card-top-accent"></div>

            <div className="card-header-block">
              <div className="card-badge-security">
                <ShieldCheck size={14} className="badge-shield-icon" />
                <span>Portal Oficial Seguro</span>
              </div>
              <h2 className="card-login-title">Iniciar Sesión</h2>
              <p className="card-login-subtitle">Sistema Padrón de Beneficiarios</p>
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
                  <span className="field-icon-box">
                    <User size={18} className="field-left-icon" />
                  </span>
                  <input
                    id="usuario"
                    name="usuario"
                    type="text"
                    value={form.usuario}
                    onChange={handleChange}
                    placeholder="Ingresa tu usuario institucional"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="form-input-group">
                <label htmlFor="password" className="field-label">Contraseña</label>
                <div className="input-field-wrapper">
                  <span className="field-icon-box">
                    <Lock size={18} className="field-left-icon" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
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
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <ArrowRight size={18} className="btn-arrow-icon" />
                  </>
                )}
              </button>
            </form>

            {/* Accesos rápidos de prueba institucional */}
            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
              <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginBottom: '8px', fontWeight: 600 }}>
                Cuentas oficiales autorizadas (Clic para autocompletar):
              </p>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    setForm({ usuario: 'prueba@gmail.com.mx', password: '123456789' });
                    setError('');
                  }}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 9px',
                    fontSize: '11px',
                    color: '#1e293b',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm({ usuario: 'difmunicipal@gmail.com.mx', password: 'dif123' });
                    setError('');
                  }}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 9px',
                    fontSize: '11px',
                    color: '#1e293b',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  Capturista
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm({ usuario: 'supervisor@gmail.com.mx', password: 'supervisor123' });
                    setError('');
                  }}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 9px',
                    fontSize: '11px',
                    color: '#1e293b',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  Supervisor
                </button>
              </div>
            </div>

            {/* Pie de confianza institucional */}
            <div className="card-footer-trust">
              <div className="trust-divider"></div>
              <div className="trust-content">
                <Building2 size={13} className="trust-icon" />
                <span>Ayuntamiento de Tuxtla Gutiérrez • 2024–2027</span>
              </div>
              <p className="trust-note">
                Acceso restringido a personal y dependencias autorizadas
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
