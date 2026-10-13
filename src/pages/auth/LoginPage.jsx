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
  Loader2
} from 'lucide-react';

import tuxtlaHeaderLogo from '../../assets/tuxtla_brand_header.png';
import tuxtlaHero3D from '../../assets/tuxtla_hero_3d.png';
import patternTopRight from '../../assets/pattern_top_right_trans.png';
import patternBottomRight from '../../assets/pattern_bottom_right_trans.png';
import patternBottomLeft from '../../assets/pattern_bottom_left_trans.png';
import patternRightSide from '../../assets/pattern_right_side_trans.png';

import './LoginPage.css';

/**
 * LoginPage — Pantalla oficial de acceso con diseño institucional de Tuxtla Gutiérrez,
 * bordados chiapanecos tradicionales, ilustración 3D del Cañón del Sumidero y tarjeta moderna.
 */
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ usuario: 'supervisor', password: '123' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const rolesDemo = [
    { label: 'Admin', user: 'admin', icon: Shield },
    { label: 'Supervisor', user: 'supervisor', icon: CheckCircle2 },
    { label: 'Capturista', user: 'capturista', icon: ClipboardEdit },
    { label: 'Consultor', user: 'consultor', icon: Search },
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
    <div className="tuxtla-login-wrapper">
      {/* Patrones decorativos de bordado chiapaneco en los bordes */}
      <img src={patternTopRight} alt="" className="bg-pattern pattern-top-right" />
      <img src={patternBottomRight} alt="" className="bg-pattern pattern-bottom-right" />
      <img src={patternBottomLeft} alt="" className="bg-pattern pattern-bottom-left" />
      <img src={patternRightSide} alt="" className="bg-pattern pattern-right-side" />

      <div className="tuxtla-login-container">
        {/* COLUMNA IZQUIERDA: Identidad municipal e ilustración 3D */}
        <div className="login-left-section">
          <div className="tuxtla-branding-header">
            <img 
              src={tuxtlaHeaderLogo} 
              alt="Tuxtla Gutiérrez Ayuntamiento 2024-2027 | Secretaría de Planeación" 
              className="tuxtla-logo-img" 
            />
          </div>

          <h1 className="login-main-title">
            SISTEMA PADRÓN DE<br />
            BENEFICIARIOS MUNICIPALES
          </h1>

          <div className="login-hero-artwork">
            <img 
              src={tuxtlaHero3D} 
              alt="Padrón de Beneficiarios Tuxtla Gutiérrez" 
              className="hero-3d-img" 
            />
          </div>
        </div>

        {/* COLUMNA DERECHA: Tarjeta de inicio de sesión */}
        <div className="login-right-section">
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
              <div className="demo-accounts-header">
                USUARIOS DE PRUEBA (CLIC PARA AUTOCOMPLETAR)
              </div>
              <div className="demo-pills-grid">
                {rolesDemo.map((r) => {
                  const Icon = r.icon;
                  const isSelected = form.usuario.toLowerCase() === r.user;
                  return (
                    <button
                      type="button"
                      key={r.user}
                      onClick={() => handleSelectDemo(r.user)}
                      className={`demo-pill-btn ${isSelected ? 'demo-pill-btn--active' : ''}`}
                    >
                      <Icon size={16} className="pill-icon" />
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="demo-pwd-hint">Contraseña por defecto: 1234</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
