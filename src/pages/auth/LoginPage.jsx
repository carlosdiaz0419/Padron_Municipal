import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../services/api';
import { 
  Building2, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle,
  Shield,
  CheckCircle2,
  ClipboardEdit,
  SearchCheck,
  Loader2
} from 'lucide-react';
import './LoginPage.css';

/**
 * LoginPage — Pantalla de inicio de sesión rediseñada con tema blanco y Lucide icons.
 */
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ usuario: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const rolesDemo = [
    { label: 'Admin', user: 'admin', icon: Shield, desc: 'Control Total' },
    { label: 'Supervisor', user: 'supervisor', icon: CheckCircle2, desc: 'Validaciones' },
    { label: 'Capturista', user: 'capturista', icon: ClipboardEdit, desc: 'Captura y Registro' },
    { label: 'Consultor', user: 'consultor', icon: SearchCheck, desc: 'Solo Lectura' },
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
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Building2 size={26} strokeWidth={2.2} />
          </div>
          <h1>Sistema de Padrón</h1>
          <p>Beneficiarios de Programas Sociales</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert--error" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div className="login-field">
            <label htmlFor="usuario">Usuario</label>
            <div className="input-with-icon">
              <span className="input-icon-left">
                <User size={18} />
              </span>
              <input
                id="usuario"
                name="usuario"
                type="text"
                value={form.usuario}
                onChange={handleChange}
                placeholder="Nombre de usuario"
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Contraseña</label>
            <div className="input-with-icon">
              <span className="input-icon-left">
                <Lock size={18} />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login-submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
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

        <div className="demo-accounts">
          <div className="demo-accounts__title">Usuarios de Prueba (Clic para autocompletar)</div>
          <div className="demo-chips">
            {rolesDemo.map((r) => {
              const Icon = r.icon;
              const isSelected = form.usuario.toLowerCase() === r.user;
              return (
                <button
                  type="button"
                  key={r.user}
                  onClick={() => handleSelectDemo(r.user)}
                  className={`demo-chip ${isSelected ? 'demo-chip--active' : ''}`}
                >
                  <span className="demo-chip__icon">
                    <Icon size={16} />
                  </span>
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
          <p className="demo-hint">Contraseña por defecto: <strong>1234</strong></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
