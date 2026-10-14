import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Award,
  Layers,
  Info
} from 'lucide-react';

/**
 * AdminDashboard — Panel principal del Administrador con diseño profesional,
 * métricas en tiempo real, tarjetas de módulos coloridas e interactivas.
 */
function AdminDashboard() {
  return (
    <div>
      {/* ── HERO BANNER DEL ADMINISTRADOR ── */}
      <div className="dashboard-hero dashboard-hero--admin">
        <div>
          <span className="dashboard-hero__badge">
            <Sparkles size={13} />
            Administración Central • Tuxtla Gutiérrez
          </span>
          <h1 className="dashboard-hero__title">Panel de Administración</h1>
          <p className="dashboard-hero__desc">
            Bienvenido al centro de control del Sistema de Padrón de Beneficiarios Municipales. Supervisa accesos, configura catálogos y audita la actividad general.
          </p>
        </div>
        <div className="dashboard-hero__meta">
          <div className="dashboard-hero__pill">
            <span className="status-dot-pulse"></span>
            <span>Sistema Operativo</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
            Ayuntamiento 2024-2027
          </span>
        </div>
      </div>

      {/* ── KPI STATS EN TIEMPO REAL ── */}
      <div className="stats-grid">
        <div className="stat-card stat-card--blue">
          <div className="stat-card__info">
            <span className="stat-card__label">Usuarios con Acceso</span>
            <span className="stat-card__value">4</span>
            <span className="stat-card__badge" style={{ color: '#2563eb' }}>
              Admin, Superv, Capt, Cons
            </span>
          </div>
          <div className="stat-card__icon">
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card stat-card--purple">
          <div className="stat-card__info">
            <span className="stat-card__label">Padrón Registrado</span>
            <span className="stat-card__value">1,280</span>
            <span className="stat-card__badge" style={{ color: '#7c3aed' }}>
              Beneficiarios Activos
            </span>
          </div>
          <div className="stat-card__icon">
            <Award size={22} />
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__info">
            <span className="stat-card__label">Programas Sociales</span>
            <span className="stat-card__value">6</span>
            <span className="stat-card__badge" style={{ color: '#059669' }}>
              Catálogos Oficiales
            </span>
          </div>
          <div className="stat-card__icon">
            <Layers size={22} />
          </div>
        </div>

        <div className="stat-card stat-card--amber">
          <div className="stat-card__info">
            <span className="stat-card__label">Auditoría y Logs</span>
            <span className="stat-card__value">100%</span>
            <span className="stat-card__badge" style={{ color: '#d97706' }}>
              Trazabilidad Activa
            </span>
          </div>
          <div className="stat-card__icon">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* ── SECCIÓN DE MÓDULOS DE ACCIÓN RÁPIDA ── */}
      <div className="section-heading">
        <div>
          <h2 className="section-heading__title">
            <span>Módulos de Gestión Administrativa</span>
          </h2>
          <p className="section-heading__desc">
            Accede a las herramientas de control y configuración del sistema
          </p>
        </div>
      </div>

      <div className="cards-grid">
        {/* Módulo 1: Usuarios */}
        <Link to="/admin/usuarios" className="module-card-link">
          <div className="module-card module-card--blue">
            <div className="module-card__accent"></div>
            <div className="module-card__header">
              <div className="module-card__icon-wrap">
                <Users size={24} />
              </div>
              <span className="module-card__category">Gestión</span>
            </div>
            <h3 className="module-card__title">Usuarios y Accesos</h3>
            <p className="module-card__desc">
              Gestiona cuentas de capturistas, supervisores, consultores y administradores con permisos por rol.
            </p>
            <div className="module-card__footer">
              <span>Ingresar al módulo</span>
              <span className="module-card__arrow"><ArrowRight size={16} /></span>
            </div>
          </div>
        </Link>

        {/* Módulo 2: Catálogos */}
        <Link to="/admin/catalogos" className="module-card-link">
          <div className="module-card module-card--purple">
            <div className="module-card__accent"></div>
            <div className="module-card__header">
              <div className="module-card__icon-wrap">
                <BookOpen size={24} />
              </div>
              <span className="module-card__category">Configuración</span>
            </div>
            <h3 className="module-card__title">Catálogos del Sistema</h3>
            <p className="module-card__desc">
              Administra programas sociales, municipios, localidades, tipos de apoyo y estructuras presupuestales.
            </p>
            <div className="module-card__footer">
              <span>Ingresar al módulo</span>
              <span className="module-card__arrow"><ArrowRight size={16} /></span>
            </div>
          </div>
        </Link>

        {/* Módulo 3: Métricas y Reportes */}
        <Link to="/admin/reportes" className="module-card-link">
          <div className="module-card module-card--green">
            <div className="module-card__accent"></div>
            <div className="module-card__header">
              <div className="module-card__icon-wrap">
                <BarChart3 size={24} />
              </div>
              <span className="module-card__category">Estadísticas</span>
            </div>
            <h3 className="module-card__title">Métricas y Reportes</h3>
            <p className="module-card__desc">
              Consulta estadísticas en tiempo real, consolidados generales y exportación de padrones en formato Excel.
            </p>
            <div className="module-card__footer">
              <span>Ingresar al módulo</span>
              <span className="module-card__arrow"><ArrowRight size={16} /></span>
            </div>
          </div>
        </Link>

        {/* Módulo 4: Auditoría */}
        <Link to="/admin/auditoria" className="module-card-link">
          <div className="module-card module-card--amber">
            <div className="module-card__accent"></div>
            <div className="module-card__header">
              <div className="module-card__icon-wrap">
                <ShieldCheck size={24} />
              </div>
              <span className="module-card__category">Seguridad</span>
            </div>
            <h3 className="module-card__title">Auditoría de Actividad</h3>
            <p className="module-card__desc">
              Historial detallado de altas, modificaciones, validaciones y bajas con registro de fecha y usuario responsable.
            </p>
            <div className="module-card__footer">
              <span>Ingresar al módulo</span>
              <span className="module-card__arrow"><ArrowRight size={16} /></span>
            </div>
          </div>
        </Link>
      </div>

      {/* ── BANNER DE AYUDA Y CONSEJO ── */}
      <div className="dashboard-tips-card">
        <div className="dashboard-tips__info">
          <div className="dashboard-tips__icon">
            <Info size={20} />
          </div>
          <div className="dashboard-tips__text">
            <h4>Rol de Administrador Central</h4>
            <p>Puedes editar cualquier usuario o catálogo en tiempo real. Los cambios se reflejarán instantáneamente en las sesiones de los capturistas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
